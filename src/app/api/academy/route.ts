import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const courses = await prisma.trainingCourse.findMany({
      orderBy: { enrolledCount: 'desc' },
      include: {
        enrollments: {
          take: 5,
        },
      },
    });

    const formatted = courses.map((c) => ({
      ...c,
      modules: JSON.parse(c.modules || '[]'),
    }));

    return NextResponse.json({ success: true, courses: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, businessId, participantName, participantEmail } = body;

    if (!courseId || !participantName || !participantEmail) {
      return NextResponse.json({ error: 'Missing required enrollment parameters' }, { status: 400 });
    }

    let bId = businessId;
    if (!bId) {
      const partnerBusiness = await prisma.business.findFirst({
        where: { ownerId: user.id },
      });
      bId = partnerBusiness?.id;
    }

    if (!bId) {
      const anyBusiness = await prisma.business.findFirst();
      bId = anyBusiness?.id;
    }

    const enrollment = await prisma.trainingEnrollment.create({
      data: {
        courseId,
        businessId: bId,
        participantName,
        participantEmail,
        status: 'ENROLLED',
        certificateNumber: `LUX-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      include: { course: true },
    });

    await prisma.trainingCourse.update({
      where: { id: courseId },
      data: { enrolledCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Enrollment failed' }, { status: 500 });
  }
}
