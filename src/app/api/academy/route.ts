import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, forbidden, handleRouteError, notFound, parseBody, requireRole } from '@/lib/api';

export const revalidate = 300;

export async function GET() {
  try {
    const courses = await prisma.trainingCourse.findMany({
      orderBy: { enrolledCount: 'desc' },
    });

    return NextResponse.json({
      success: true,
      courses: courses.map((c) => ({ ...c, modules: JSON.parse(c.modules || '[]') })),
    });
  } catch (error) {
    return handleRouteError(error, 'academy GET');
  }
}

const enrollSchema = z.object({
  courseId: z.string().min(1),
  businessId: z.string().min(1).optional(),
  participantName: z.string().trim().min(2, 'Enter the participant name').max(80),
  participantEmail: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

/**
 * Enrols a staff member on behalf of a partner listing.
 *
 * The enrolment must be attached to a listing the caller actually owns. The
 * previous implementation fell back to `business.findFirst()`, which attached
 * the record — and the certificate — to an unrelated partner's business.
 */
export async function POST(req: Request) {
  try {
    const user = await requireRole('SERVICE_OWNER', 'ADMIN');
    const input = await parseBody(req, enrollSchema);

    const course = await prisma.trainingCourse.findUnique({ where: { id: input.courseId } });
    if (!course) throw notFound('Course not found');

    const business = input.businessId
      ? await prisma.business.findUnique({ where: { id: input.businessId } })
      : await prisma.business.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: 'asc' } });

    if (!business) {
      throw badRequest('Add your business listing before enrolling staff in the Academy');
    }
    if (user.role !== 'ADMIN' && business.ownerId !== user.id) {
      throw forbidden('You can only enrol staff against your own listings');
    }

    const enrollment = await prisma.$transaction(async (tx) => {
      const created = await tx.trainingEnrollment.create({
        data: {
          courseId: course.id,
          businessId: business.id,
          participantName: input.participantName,
          participantEmail: input.participantEmail,
          status: 'ENROLLED',
        },
        include: { course: true },
      });

      await tx.trainingCourse.update({
        where: { id: course.id },
        data: { enrolledCount: { increment: 1 } },
      });

      return created;
    });

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'academy POST');
  }
}
