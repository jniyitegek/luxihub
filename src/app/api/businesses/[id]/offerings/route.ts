import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { forbidden, handleRouteError, notFound, parseBody, requireRole } from '@/lib/api';

export const dynamic = 'force-dynamic';

const imagePathOrUrl = z.string().trim().refine(
  (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: 'Must be a valid URL or image path' }
);

const createSchema = z.object({
  category: z.string().trim().min(1).default('STAYS'),
  subType: z.string().trim().optional(),
  title: z.string().trim().min(3, 'Give the listing a title').max(140),
  description: z.string().trim().min(10, 'Describe what the listing includes').max(2000),
  price: z.coerce.number().positive('Enter a price').max(100_000_000),
  capacity: z.coerce.number().int().min(1).max(500).default(2),
  unit: z.string().trim().min(1).default('per_night'),
  currency: z.string().trim().length(3).default('RWF'),
  duration: z.string().trim().max(80).optional(),
  coverImage: z.string().trim().optional(),
  images: z.array(imagePathOrUrl).max(20).default([]),
  inclusions: z.array(z.string().trim().max(200)).max(40).default([]),
  attributes: z.record(z.any()).optional().default({}),
});

/** Adds a new listing to a business entry the caller owns. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');

    const business = await prisma.business.findUnique({ where: { id: params.id }, select: { id: true, ownerId: true } });
    if (!business) throw notFound('Business not found');
    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
    }

    const input = await parseBody(req, createSchema);
    const coverImage = input.coverImage || input.images[0] || null;

    const offering = await prisma.serviceOffering.create({
      data: {
        businessId: business.id,
        category: input.category,
        subType: input.subType || null,
        title: input.title,
        description: input.description,
        price: input.price,
        capacity: input.capacity,
        unit: input.unit,
        currency: input.currency,
        duration: input.duration || null,
        coverImage,
        images: JSON.stringify(input.images),
        inclusions: JSON.stringify(input.inclusions),
        attributes: JSON.stringify(input.attributes),
      } as any,
    });

    return NextResponse.json(
      {
        success: true,
        offering: {
          ...offering,
          images: input.images,
          inclusions: input.inclusions,
          attributes: input.attributes,
          coverImage,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error, 'businesses/[id]/offerings POST');
  }
}
