import { NextResponse } from 'next/server';
import { z, ZodError, ZodTypeAny } from 'zod';
import { getCurrentUser } from './auth';
import { isProd } from './env';
import { UserRole, UserSession } from './types';

/**
 * Shared helpers for API route handlers.
 *
 * The goal is that every route fails the same way: a predictable JSON shape, a
 * correct status code, and — in production — no internal detail (stack traces,
 * Prisma messages, constraint names) leaking to the caller.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const badRequest = (message: string, details?: unknown) => new ApiError(400, message, details);
export const unauthorized = (message = 'Authentication required') => new ApiError(401, message);
export const forbidden = (message = 'You do not have access to this resource') => new ApiError(403, message);
export const notFound = (message = 'Not found') => new ApiError(404, message);
export const conflict = (message: string) => new ApiError(409, message);

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(details ? { error: message, details } : { error: message }, { status });
}

/**
 * Converts anything thrown inside a route handler into a safe response.
 * Unexpected errors are logged in full server-side and reported generically.
 */
export function handleRouteError(error: unknown, context: string) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status, error.details);
  }

  if (error instanceof ZodError) {
    return jsonError('The submitted data is invalid', 400, fieldErrors(error));
  }

  console.error(`[${context}]`, error);

  return jsonError(
    isProd ? 'Something went wrong. Please try again.' : `${context}: ${(error as Error)?.message ?? 'Unknown error'}`,
    500
  );
}

function fieldErrors(error: ZodError) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join('.') || 'body';
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

/** Parses and validates a JSON request body, throwing `ApiError` on failure. */
export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest('Request body must be valid JSON');
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw badRequest('The submitted data is invalid', fieldErrors(result.error));
  }
  return result.data;
}

/** Parses and validates query-string parameters. */
export function parseQuery<S extends ZodTypeAny>(req: Request, schema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    throw badRequest('Invalid query parameters', fieldErrors(result.error));
  }
  return result.data;
}

export async function requireUser(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<UserSession> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw forbidden(`This action requires one of the following roles: ${roles.join(', ')}`);
  }
  return user;
}

/** Best-effort client IP, used for abuse controls only — never for identity. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1';
}
