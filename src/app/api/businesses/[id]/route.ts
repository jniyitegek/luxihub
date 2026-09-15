import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { forbidden, handleRouteError, notFound, parseBody, requireUser } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const business = await prisma.business.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        offerings: { where: { isAvailable: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { name: true, avatarUrl: true } } },
        },
        audits: { orderBy: { auditDate: 'desc' }, take: 1 },
      },
    });

    if (!business) throw notFound('Business not found');

    // Listings that are pending approval or suspended stay hidden from the
    // public directory; the owner and administrators can still open them.
    if (business.status !== 'VERIFIED') {
      const user = await getCurrentUser();
      const canView = user && (user.role === 'ADMIN' || business.ownerId === user.id);
      if (!canView) throw notFound('Business not found');
    }

    return NextResponse.json({
      success: true,
      business: {
        ...business,
        amenities: JSON.parse(business.amenities || '[]'),
        images: JSON.parse(business.images || '[]'),
        qualityScore: business.audits[0]?.score ?? null,
        offerings: business.offerings.map((o) => ({
          ...o,
          images: JSON.parse(o.images || '[]'),
          inclusions: JSON.parse(o.inclusions || '[]'),
        })),
        audits: business.audits.map((a) => ({
          ...a,
          inspectionItems: JSON.parse(a.inspectionItems || '[]'),
        })),
      },
    });
  } catch (error) {
    return handleRouteError(error, 'businesses/[id] GET');
  }
}

const patchSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(40).max(5000).optional(),
  shortTagline: z.string().trim().max(160).optional(),
  address: z.string().trim().min(5).max(240).optional(),
  location: z.enum(['Kigali', 'Musanze', 'Rubavu', 'Nyungwe', 'Akagera']).optional(),
  basePrice: z.coerce.number().positive().max(100_000_000).optional(),
  amenities: z.array(z.string().trim().max(120)).max(40).optional(),
  images: z.array(z.string().url()).max(20).optional(),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  website: z.string().trim().url().optional().or(z.literal('')),

  // Administrator-only fields, ignored for any other caller.
  status: z.enum(['PENDING', 'VERIFIED', 'SUSPENDED']).optional(),
  certificationBadge: z.enum(['LUXE_VERIFIED', 'GOLD_STANDARD', 'ECO_SUSTAINABLE', 'NONE']).optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const input = await parseBody(req, patchSchema);

    const existing = await prisma.business.findUnique({ where: { id: params.id } });
    if (!existing) throw notFound('Business not found');
    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
    }

    const data: Record<string, unknown> = {};
    const assign = <K extends keyof typeof input>(key: K) => {
      if (input[key] !== undefined) data[key as string] = input[key];
    };

    (['name', 'description', 'shortTagline', 'address', 'location', 'basePrice', 'phone', 'email'] as const).forEach(assign);
    if (input.website !== undefined) data.website = input.website || null;
    if (input.amenities) data.amenities = JSON.stringify(input.amenities);
    if (input.images) data.images = JSON.stringify(input.images);

    if (user.role === 'ADMIN') {
      (['status', 'certificationBadge', 'isFeatured'] as const).forEach(assign);
    }

    const updated = await prisma.business.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    return handleRouteError(error, 'businesses/[id] PATCH');
  }
}
