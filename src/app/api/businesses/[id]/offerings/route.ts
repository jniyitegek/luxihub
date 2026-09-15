import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { forbidden, handleRouteError, notFound, parseBody, requireRole } from '@/lib/api';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().trim().min(3, 'Give the package a title').max(140),
  description: z.string().trim().min(10, 'Describe what the package includes').max(2000),
  price: z.coerce.number().positive('Enter a price').max(100_000_000),
  capacity: z.coerce.number().int().min(1).max(50).default(2),
  unit: z.enum(['per_night', 'per_person', 'per_table', 'per_tour']).default('per_night'),
  currency: z.string().trim().length(3).default('RWF'),
  duration: z.string().trim().max(80).optional(),
  images: z.array(z.string().url()).max(20).default([]),
  inclusions: z.array(z.string().trim().max(200)).max(40).default([]),
});

/** Adds a suite, table or expedition package to a listing the caller owns. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole('PARTNER', 'ADMIN');

    const business = await prisma.business.findUnique({ where: { id: params.id }, select: { id: true, ownerId: true } });
    if (!business) throw notFound('Business not found');
    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
    }

    const input = await parseBody(req, createSchema);

    const offering = await prisma.serviceOffering.create({
      data: {
        businessId: business.id,
        title: input.title,
        description: input.description,
        price: input.price,
        capacity: input.capacity,
        unit: input.unit,
        currency: input.currency,
        duration: input.duration || null,
        images: JSON.stringify(input.images),
        inclusions: JSON.stringify(input.inclusions),
      },
    });

    return NextResponse.json(
      {
        success: true,
        offering: { ...offering, images: input.images, inclusions: input.inclusions },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error, 'businesses/[id]/offerings POST');
  }
}
