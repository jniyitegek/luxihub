import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, sessionCookie, signToken, toSession } from '@/lib/auth';
import { clientIp, conflict, handleRouteError, jsonError, parseBody } from '@/lib/api';
import { consume } from '@/lib/rateLimit';
import { isRwandanMobile, formatMsisdn } from '@/lib/payments/phone';
import { generateRef } from '@/lib/utils';

const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'msn.com',
]);

function isPublicEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? PUBLIC_EMAIL_DOMAINS.has(domain) : true;
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters long').max(80, 'Name is too long'),
    businessName: z.string().trim().optional(),
    email: z.string().trim().toLowerCase().email('Enter a valid email address (e.g. name@company.com)'),
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters long')
      .max(200, 'Password is too long')
      .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), 'Password must include at least one letter (a-z) and one number (0-9)'),
    role: z.enum(['CUSTOMER', 'SERVICE_OWNER']).optional().default('CUSTOMER'),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || isRwandanMobile(v), 'Enter a valid Rwandan mobile number (e.g. +250 788 000 000) or leave blank'),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must check the box to accept the Terms of Use' }),
    }),
  })
  .refine(
    (data) => {
      if (data.role === 'SERVICE_OWNER') {
        return Boolean(data.businessName && data.businessName.trim().length >= 2);
      }
      return true;
    },
    {
      message: 'Enter your Business / Establishment Name',
      path: ['businessName'],
    }
  );

export async function POST(req: Request) {
  try {
    const limit = consume(`register:ip:${clientIp(req)}`, 10, 60 * 60);
    if (!limit.allowed) {
      return jsonError('Too many accounts created from this network. Please try again later.', 429);
    }

    const { name, businessName, email, password, role: requestedRole, phone } = await parseBody(req, registerSchema);

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw conflict('An account already exists for this email address. Try signing in instead.');
    }

    const assignedRole = requestedRole === 'SERVICE_OWNER' ? 'SERVICE_OWNER' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
        role: assignedRole,
        phone: phone ? formatMsisdn(phone) : null,
      },
    });

    // If registering as a SERVICE_OWNER, provision initial business record
    if (assignedRole === 'SERVICE_OWNER') {
      const publicDomain = isPublicEmailDomain(email);
      // Custom/corporate domain -> provisionally verified (isVerified=true), but flags needsAdminAudit=true for admin review
      // Public domain -> isVerified=false, needsAdminAudit=false
      const isVerified = !publicDomain;
      const needsAdminAudit = !publicDomain;

      const actualBusinessName = (businessName && businessName.trim()) || `${name}'s Establishment`;
      const slugBase = actualBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'service';
      const slug = `${slugBase}-${generateRef('BIZ').toLowerCase()}`;

      await prisma.business.create({
        data: {
          ownerId: user.id,
          name: actualBusinessName,
          slug,
          type: 'HOTEL',
          location: 'Kigali',
          address: 'Kigali, Rwanda',
          description: 'Verified luxury service establishment provisioned upon service owner onboarding.',
          status: 'VERIFIED',
          certificationBadge: isVerified ? 'LUXE_VERIFIED' : 'NONE',
          isVerified,
          verificationSource: 'BUSINESS_REGISTRATION',
          needsAdminAudit,
          email,
          phone: phone ? formatMsisdn(phone) : null,
        },
      });
    }

    const session = toSession(user);
    const response = NextResponse.json({ success: true, user: session }, { status: 201 });
    response.cookies.set(sessionCookie(await signToken(session)));
    return response;
  } catch (error) {
    return handleRouteError(error, 'auth/register');
  }
}
