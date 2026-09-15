import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleRouteError, notFound, parseBody, parseQuery, requireRole } from '@/lib/api';
import { evaluateBusinessQuality, QA_STANDARDS_CHECKLIST } from '@/lib/qualityEngine';

export const dynamic = 'force-dynamic';

const querySchema = z.object({ businessId: z.string().trim().min(1).optional() });

export async function GET(req: Request) {
  try {
    const { businessId } = parseQuery(req, querySchema);
    if (!businessId) {
      return NextResponse.json({ success: true, checklist: QA_STANDARDS_CHECKLIST });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { audits: { orderBy: { auditDate: 'desc' }, take: 5 } },
    });
    if (!business) throw notFound('Business not found');

    const criteria = await prisma.review.aggregate({
      where: { businessId },
      _avg: { cleanlinessRating: true, serviceRating: true, hospitalityRating: true },
    });

    const evaluation = evaluateBusinessQuality({
      reviewCount: business.reviewCount,
      ratingAvg: business.ratingAvg,
      cleanlinessAvg: criteria._avg.cleanlinessRating ?? 0,
      serviceAvg: criteria._avg.serviceRating ?? 0,
      hospitalityAvg: criteria._avg.hospitalityRating ?? 0,
      responseRate: business.responseRate,
      auditChecklistScore: business.audits[0]?.score,
    });

    return NextResponse.json({
      success: true,
      businessId,
      businessName: business.name,
      currentBadge: business.certificationBadge,
      evaluation,
      recentAudits: business.audits.map((a) => ({ ...a, inspectionItems: JSON.parse(a.inspectionItems || '[]') })),
    });
  } catch (error) {
    return handleRouteError(error, 'quality-engine/audit GET');
  }
}

const auditSchema = z.object({
  businessId: z.string().min(1),
  score: z.coerce.number().int().min(0, 'Score must be between 0 and 100').max(100, 'Score must be between 0 and 100'),
  notes: z.string().trim().max(4000).optional(),
  // Accepts both shapes the auditor tools produce: a per-category subtotal
  // from the inspection form, and a per-criterion pass/fail line from the
  // full 40-point checklist.
  inspectionItems: z
    .array(
      z.object({
        category: z.string().trim().max(80),
        item: z.string().trim().max(300).optional(),
        passed: z.boolean().optional(),
        score: z.coerce.number().min(0).max(100),
        max: z.coerce.number().min(0).max(100).optional(),
      })
    )
    .max(80)
    .default([]),
});

/**
 * Records an official inspection. The badge is always derived from the score
 * server-side so an auditor cannot grant a certification the score does not
 * support.
 */
function badgeForScore(score: number) {
  if (score >= 95) return 'GOLD_STANDARD';
  if (score >= 80) return 'LUXE_VERIFIED';
  if (score >= 70) return 'ECO_SUSTAINABLE';
  return 'NONE';
}

export async function POST(req: Request) {
  try {
    const user = await requireRole('ADMIN');
    const input = await parseBody(req, auditSchema);

    const business = await prisma.business.findUnique({ where: { id: input.businessId }, select: { id: true } });
    if (!business) throw notFound('Business not found');

    const badgeGranted = badgeForScore(input.score);

    const audit = await prisma.$transaction(async (tx) => {
      const created = await tx.qAAudit.create({
        data: {
          businessId: business.id,
          auditorName: user.name,
          score: input.score,
          badgeGranted,
          notes: input.notes || 'Official Higa Lux Rwandan quality assurance audit completed.',
          inspectionItems: JSON.stringify(input.inspectionItems),
          auditDate: new Date(),
        },
      });

      await tx.business.update({
        where: { id: business.id },
        data: {
          certificationBadge: badgeGranted,
          status: badgeGranted === 'NONE' ? 'PENDING' : 'VERIFIED',
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      audit,
      message: `QA audit recorded. Certification updated to ${badgeGranted.replace(/_/g, ' ')}.`,
    });
  } catch (error) {
    return handleRouteError(error, 'quality-engine/audit POST');
  }
}
