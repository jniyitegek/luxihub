import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Advanced Visibility Tools: promotional placement boost plans
const BOOST_PLANS: Record<string, { label: string; days: number; price: number }> = {
  WEEK: { label: '7-Day Homepage Spotlight', days: 7, price: 60000 },
  MONTH: { label: '30-Day Homepage Spotlight', days: 30, price: 200000 },
};

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Partner or Admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    const business = businessId
      ? await prisma.business.findUnique({ where: { id: businessId } })
      : await prisma.business.findFirst({ where: { ownerId: user.id } });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      isFeatured: business.isFeatured,
      featuredUntil: business.featuredUntil,
      plans: BOOST_PLANS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch visibility status' }, { status: 500 });
  }
}

// Purchase a promotional visibility boost for the caller's business
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Partner or Admin role required.' }, { status: 403 });
    }

    const body = await req.json();
    const { businessId, plan } = body;

    if (!plan || !BOOST_PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid visibility plan' }, { status: 400 });
    }

    const business = businessId
      ? await prisma.business.findUnique({ where: { id: businessId } })
      : await prisma.business.findFirst({ where: { ownerId: user.id } });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing.' }, { status: 403 });
    }

    const selectedPlan = BOOST_PLANS[plan];
    const baseDate = business.featuredUntil && business.featuredUntil > new Date() ? business.featuredUntil : new Date();
    const featuredUntil = new Date(baseDate);
    featuredUntil.setDate(featuredUntil.getDate() + selectedPlan.days);

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        isFeatured: true,
        featuredUntil,
      },
    });

    return NextResponse.json({
      success: true,
      isFeatured: updated.isFeatured,
      featuredUntil: updated.featuredUntil,
      message: `${selectedPlan.label} activated through ${featuredUntil.toLocaleDateString()}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to purchase visibility boost' }, { status: 500 });
  }
}
