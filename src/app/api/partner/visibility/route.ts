import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { forbidden, handleRouteError, notFound, requireRole } from '@/lib/api';

// Advanced Visibility Tools: promotional placement boost plans
const BOOST_PLANS: Record<string, { label: string; days: number; price: number }> = {
  WEEK: { label: '7-Day Homepage Spotlight', days: 7, price: 60000 },
  MONTH: { label: '30-Day Homepage Spotlight', days: 30, price: 200000 },
};

export async function GET(req: Request) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    const business = businessId
      ? await prisma.business.findUnique({ where: { id: businessId } })
      : await prisma.business.findFirst({ where: { ownerId: user.id } });

    if (!business) throw notFound('Business not found');

    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
    }

    return NextResponse.json({
      success: true,
      isFeatured: business.isFeatured,
      featuredUntil: business.featuredUntil,
      plans: BOOST_PLANS,
    });
  } catch (error) {
    return handleRouteError(error, 'partner/visibility');
  }
}

// Purchase a promotional visibility boost for the caller's business
export async function POST(req: Request) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');

    const body = await req.json();
    const { businessId, plan } = body;

    if (!plan || !BOOST_PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid visibility plan' }, { status: 400 });
    }

    const business = businessId
      ? await prisma.business.findUnique({ where: { id: businessId } })
      : await prisma.business.findFirst({ where: { ownerId: user.id } });

    if (!business) throw notFound('Business not found');

    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You do not own this listing');
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
  } catch (error) {
    return handleRouteError(error, 'partner/visibility');
  }
}
