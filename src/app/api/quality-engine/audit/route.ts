import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { evaluateBusinessQuality, QA_STANDARDS_CHECKLIST } from '@/lib/qualityEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ checklist: QA_STANDARDS_CHECKLIST });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        reviews: true,
        audits: {
          orderBy: { auditDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const cleanlinessAvg = business.reviews.length
      ? business.reviews.reduce((acc, r) => acc + r.cleanlinessRating, 0) / business.reviews.length
      : 5;
    const serviceAvg = business.reviews.length
      ? business.reviews.reduce((acc, r) => acc + r.serviceRating, 0) / business.reviews.length
      : 5;
    const hospitalityAvg = business.reviews.length
      ? business.reviews.reduce((acc, r) => acc + r.hospitalityRating, 0) / business.reviews.length
      : 5;

    const evaluation = evaluateBusinessQuality({
      reviewCount: business.reviewCount,
      ratingAvg: business.ratingAvg,
      cleanlinessAvg,
      serviceAvg,
      hospitalityAvg,
      responseRate: business.responseRate,
      auditChecklistScore: business.audits[0]?.score || 95,
    });

    return NextResponse.json({
      success: true,
      businessId,
      businessName: business.name,
      currentBadge: business.certificationBadge,
      evaluation,
      recentAudits: business.audits,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'QA assessment failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. QA Auditor (Admin) role required.' }, { status: 403 });
    }

    const body = await req.json();
    const { businessId, score, notes, inspectionItems } = body;

    const numericScore = parseInt((score ?? '').toString(), 10);
    if (!businessId || score === undefined || Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return NextResponse.json({ error: 'Missing or invalid required audit parameters' }, { status: 400 });
    }

    // Badge is derived server-side from the audit score, never trusted from the client.
    const badgeGranted =
      numericScore >= 95 ? 'GOLD_STANDARD' : numericScore >= 80 ? 'LUXE_VERIFIED' : numericScore >= 70 ? 'ECO_SUSTAINABLE' : 'NONE';

    // Create Audit record
    const audit = await prisma.qAAudit.create({
      data: {
        businessId,
        auditorName: user.name,
        score: numericScore,
        badgeGranted,
        notes: notes || 'Official Rwandan Luxe Hub Quality Assurance audit completed.',
        inspectionItems: JSON.stringify(inspectionItems || []),
        auditDate: new Date(),
      },
    });

    // Update business badge & status automatically
    await prisma.business.update({
      where: { id: businessId },
      data: {
        certificationBadge: badgeGranted,
        status: badgeGranted === 'NONE' ? 'PENDING' : 'VERIFIED',
      },
    });

    return NextResponse.json({ success: true, audit, message: `QA Audit completed. Badge updated to ${badgeGranted}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Audit execution failed' }, { status: 500 });
  }
}
