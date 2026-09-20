import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleRouteError, parseBody, parseQuery, requireRole } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const BUSINESS_TYPES = ['HOTEL', 'RESTAURANT', 'TOUR'] as const;
const REGIONS = ['Kigali', 'Musanze', 'Rubavu', 'Nyungwe', 'Akagera'] as const;
const BADGES = ['LUXE_VERIFIED', 'GOLD_STANDARD', 'ECO_SUSTAINABLE', 'NONE'] as const;

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  type: z.string().trim().optional(),
  location: z.string().trim().optional(),
  badge: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  featured: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const params = parseQuery(req, querySchema);
    const user = await getCurrentUser();

    const where: any = {};

    // The public directory shows verified listings only. Partners see their
    // own pending listings so they can work on them before approval, and
    // administrators see everything.
    if (user?.role === 'ADMIN') {
      // no status filter
    } else if (user?.role === 'SERVICE_OWNER' || (user?.role as any) === 'PARTNER') {
      where.OR = [{ status: 'VERIFIED' }, { ownerId: user?.id }];
    } else {
      where.status = 'VERIFIED';
    }

    const and: any[] = [];

    if (params.q) {
      and.push({
        OR: [
          { name: { contains: params.q, mode: 'insensitive' } },
          { description: { contains: params.q, mode: 'insensitive' } },
          { shortTagline: { contains: params.q, mode: 'insensitive' } },
          { location: { contains: params.q, mode: 'insensitive' } },
          { address: { contains: params.q, mode: 'insensitive' } },
        ],
      });
    }

    if (params.type && params.type !== 'ALL') and.push({ type: params.type });
    if (params.location && params.location !== 'ALL') and.push({ location: params.location });
    if (params.badge && params.badge !== 'ALL') and.push({ certificationBadge: params.badge });

    if (params.minPrice !== undefined) and.push({ basePrice: { gte: params.minPrice } });
    if (params.maxPrice !== undefined) and.push({ basePrice: { lte: params.maxPrice } });

    if (params.featured === 'true') {
      and.push({ isFeatured: true });
      // A spotlight that has expired should stop showing as featured.
      and.push({ OR: [{ featuredUntil: null }, { featuredUntil: { gte: new Date() } }] });
    }

    if (and.length > 0) where.AND = and;

    const businesses = await prisma.business.findMany({
      where,
      include: {
        offerings: { where: { isAvailable: true } },
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { name: true, avatarUrl: true } } },
        },
        audits: { orderBy: { auditDate: 'desc' }, take: 1 },
      },
      orderBy: [{ isFeatured: 'desc' }, { ratingAvg: 'desc' }],
    });

    const formatted = businesses.map(({ audits, ...b }) => ({
      ...b,
      amenities: JSON.parse(b.amenities || '[]'),
      images: JSON.parse(b.images || '[]'),
      qualityScore: audits[0]?.score ?? null,
      offerings: b.offerings.map((o) => ({
        ...o,
        images: JSON.parse(o.images || '[]'),
        inclusions: JSON.parse(o.inclusions || '[]'),
      })),
    }));

    return NextResponse.json({ success: true, businesses: formatted });
  } catch (error) {
    return handleRouteError(error, 'businesses GET');
  }
}

const createSchema = z.object({
  name: z.string().trim().min(3, 'Enter the business name').max(120),
  type: z.enum(BUSINESS_TYPES),
  location: z.enum(REGIONS),
  address: z.string().trim().min(5, 'Enter the physical address').max(240),
  description: z.string().trim().min(40, 'Describe the property in at least 40 characters').max(5000),
  shortTagline: z.string().trim().max(160).optional(),
  amenities: z.array(z.string().trim().max(120)).max(40).default([]),
  images: z.array(z.string().url('Each image must be a valid URL')).max(20).default([]),
  pricingTier: z.enum(['$$', '$$$', '$$$$']).default('$$$'),
  basePrice: z.coerce.number().positive('Enter a nightly or per-cover rate').max(100_000_000),
  currency: z.string().trim().length(3).default('RWF'),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  website: z.string().trim().url('Enter a valid website URL').optional().or(z.literal('')),
});

export async function POST(req: Request) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');
    const input = await parseBody(req, createSchema);

    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: input.name,
        slug: await uniqueSlug(input.name),
        type: input.type,
        location: input.location,
        address: input.address,
        description: input.description,
        shortTagline: input.shortTagline || `${input.type} in ${input.location}, Rwanda`,
        amenities: JSON.stringify(input.amenities),
        images: JSON.stringify(input.images),
        pricingTier: input.pricingTier,
        basePrice: input.basePrice,
        currency: input.currency,
        // A new listing is not certified until it passes a QA audit, and a
        // partner cannot grant themselves a badge.
        status: 'PENDING',
        certificationBadge: 'NONE',
        ratingAvg: 0,
        reviewCount: 0,
        isFeatured: false,
        phone: input.phone || user.phone || null,
        email: input.email || user.email,
        website: input.website || null,
      },
    });

    return NextResponse.json({ success: true, business }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'businesses POST');
  }
}

async function uniqueSlug(name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'listing';

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${Math.floor(100 + Math.random() * 900)}`;
    const taken = await prisma.business.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
