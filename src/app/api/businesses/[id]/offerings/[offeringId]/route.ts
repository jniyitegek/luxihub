import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { forbidden, handleRouteError, notFound, parseBody, requireRole } from '@/lib/api';

export const dynamic = 'force-dynamic';

const imagePathOrUrl = z.string().trim().refine(
  (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Must be a valid URL or image path' }
);

const updateSchema = z.object({
  category: z.string().trim().min(1).optional(),
  subType: z.string().trim().optional(),
  title: z.string().trim().min(3).max(140).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  price: z.coerce.number().positive().max(100_000_000).optional(),
  capacity: z.coerce.number().int().min(1).max(500).optional(),
  unit: z.string().trim().min(1).optional(),
  currency: z.string().trim().length(3).optional(),
  duration: z.string().trim().max(80).optional(),
  coverImage: z.string().trim().optional(),
  images: z.array(imagePathOrUrl).max(20).optional(),
  inclusions: z.array(z.string().trim().max(200)).max(40).optional(),
  attributes: z.record(z.any()).optional(),
  isAvailable: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string; offeringId: string } }) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');

    const business = await prisma.business.findUnique({ where: { id: params.id }, select: { id: true, ownerId: true } });
    if (!business) throw notFound('Business not found');
    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
    }

    const offering = await prisma.serviceOffering.findUnique({ where: { id: params.offeringId } });
    if (!offering || offering.businessId !== business.id) {
      throw notFound('Listing offering not found');
    }

    const input = await parseBody(req, updateSchema);

    const data: Record<string, unknown> = {};
    if (input.category !== undefined) data.category = input.category;
    if (input.subType !== undefined) data.subType = input.subType || null;
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = input.price;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.unit !== undefined) data.unit = input.unit;
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.duration !== undefined) data.duration = input.duration || null;
    if (input.coverImage !== undefined) data.coverImage = input.coverImage || null;
    if (input.images !== undefined) data.images = JSON.stringify(input.images);
    if (input.inclusions !== undefined) data.inclusions = JSON.stringify(input.inclusions);
    if (input.attributes !== undefined) data.attributes = JSON.stringify(input.attributes);
    if (input.isAvailable !== undefined) data.isAvailable = input.isAvailable;

    const updated = await prisma.serviceOffering.update({
      where: { id: params.offeringId },
      data,
    });

    return NextResponse.json({
      success: true,
      offering: {
        ...updated,
        images: JSON.parse(updated.images || '[]'),
        inclusions: JSON.parse(updated.inclusions || '[]'),
        attributes: JSON.parse((updated as any).attributes || '{}'),
      },
    });
  } catch (error) {
    return handleRouteError(error, 'businesses/[id]/offerings/[offeringId] PUT');
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; offeringId: string } }) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');

    const business = await prisma.business.findUnique({ where: { id: params.id }, select: { id: true, ownerId: true } });
    if (!business) throw notFound('Business not found');
    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
    }

    const offering = await prisma.serviceOffering.findUnique({ where: { id: params.offeringId } });
    if (!offering || offering.businessId !== business.id) {
      throw notFound('Listing offering not found');
    }

    await prisma.serviceOffering.delete({ where: { id: params.offeringId } });

    return NextResponse.json({ success: true, message: 'Listing removed successfully' });
  } catch (error) {
    return handleRouteError(error, 'businesses/[id]/offerings/[offeringId] DELETE');
  }
}
