import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const business = await prisma.business.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        offerings: {
          where: { isAvailable: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
        audits: {
          orderBy: { auditDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const formatted = {
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
    };

    return NextResponse.json({ success: true, business: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch business' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing.' }, { status: 403 });
    }

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.shortTagline) updateData.shortTagline = body.shortTagline;
    if (body.address) updateData.address = body.address;
    if (body.location) updateData.location = body.location;
    if (body.basePrice) updateData.basePrice = parseFloat(body.basePrice);
    if (body.amenities) updateData.amenities = JSON.stringify(body.amenities);
    if (body.images) updateData.images = JSON.stringify(body.images);
    if (body.phone) updateData.phone = body.phone;
    if (body.email) updateData.email = body.email;
    if (body.website) updateData.website = body.website;

    // Admin-only fields
    if (user.role === 'ADMIN') {
      if (body.status) updateData.status = body.status;
      if (body.certificationBadge) updateData.certificationBadge = body.certificationBadge;
      if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    }

    const updated = await prisma.business.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update business' }, { status: 500 });
  }
}
