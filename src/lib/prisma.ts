import { PrismaClient } from '@prisma/client';
import { isProd } from './env';

/**
 * A single Prisma client per process.
 *
 * In development Next.js hot-reloads modules on every edit, so the instance is
 * cached on `globalThis` to avoid exhausting the database connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}
