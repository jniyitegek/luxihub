import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Add a new suite/package/service offering to an existing business listing
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Partner or Admin role required.' }, { status: 403 });
    }

    const { id } = params;
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, capacity = 2, unit = 'per_night', currency = 'RWF', duration, images, inclusions } = body;

    if (!title || !description || price === undefined) {
      return NextResponse.json({ error: 'Missing required offering fields' }, { status: 400 });
    }

    const offering = await prisma.serviceOffering.create({
      data: {
        businessId: id,
        title,
        description,
        price: parseFloat(price),
        capacity: parseInt(capacity.toString(), 10),
        unit,
        currency,
        duration: duration || null,
        images: JSON.stringify(images || []),
        inclusions: JSON.stringify(inclusions || []),
      },
    });

    return NextResponse.json({
      success: true,
      offering: { ...offering, images: JSON.parse(offering.images), inclusions: JSON.parse(offering.inclusions) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create offering' }, { status: 500 });
  }
}
