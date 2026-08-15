import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const PLAN_CATALOG: Record<string, { name: string; monthlyPrice: number; annualPrice: number; perks: string[] }> = {
  STANDARD: {
    name: 'Verified Standard',
    monthlyPrice: 0,
    annualPrice: 0,
    perks: ['Official 40-Point Rwandan QA Audit', 'Verified Booking Escrow & MoMo Gateway', 'Standard Search Placement'],
  },
  CERTIFIED: {
    name: 'Luxe Certified Partner',
    monthlyPrice: 150000,
    annualPrice: 1500000,
    perks: ['Luxe Verified Official Quality Badge', 'Priority Listing in Search & Filter Results', '5 Free Staff Seats at Hospitality Academy'],
  },
  ELITE: {
    name: 'Elite Ambassador',
    monthlyPrice: 450000,
    annualPrice: 4500000,
    perks: ['Permanent Gold Standard Feature on Homepage', 'Dedicated Rwandan QA Auditor', 'Unlimited Staff Academy Certifications'],
  },
};

// Fetch the current subscription for the caller's business
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

    const subscription = await prisma.partnerSubscription.findFirst({
      where: { businessId: business.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      subscriptionTier: business.subscriptionTier,
      subscription: subscription
        ? { ...subscription, perks: JSON.parse(subscription.perks || '[]') }
        : null,
      catalog: PLAN_CATALOG,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch subscription' }, { status: 500 });
  }
}

// Upgrade/downgrade the caller's business subscription tier
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Partner or Admin role required.' }, { status: 403 });
    }

    const body = await req.json();
    const { businessId, planTier, billingCycle = 'MONTHLY' } = body;

    if (!planTier || !PLAN_CATALOG[planTier]) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
    }
    if (billingCycle !== 'MONTHLY' && billingCycle !== 'ANNUAL') {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
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

    const plan = PLAN_CATALOG[planTier];
    const price = billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
    const nextBillingDate = new Date();
    if (billingCycle === 'ANNUAL') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Cancel any existing active subscription for this business, then start the new one
    await prisma.partnerSubscription.updateMany({
      where: { businessId: business.id, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    const subscription = await prisma.partnerSubscription.create({
      data: {
        businessId: business.id,
        planTier,
        billingCycle,
        price,
        nextBillingDate,
        perks: JSON.stringify(plan.perks),
        status: 'ACTIVE',
      },
    });

    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: { subscriptionTier: planTier },
    });

    return NextResponse.json({
      success: true,
      subscription: { ...subscription, perks: JSON.parse(subscription.perks) },
      subscriptionTier: updatedBusiness.subscriptionTier,
      message: `Successfully updated partner membership tier to ${plan.name}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update subscription' }, { status: 500 });
  }
}
