import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateRef } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = {};
    if (user.role !== 'ADMIN') {
      whereClause.userId = user.id;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = tickets.map((t) => ({
      ...t,
      responses: JSON.parse(t.responses || '[]'),
    }));

    return NextResponse.json({ success: true, tickets: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, category = 'BOOKING', message, priority = 'HIGH' } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const ticketRef = generateRef('TICK');

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketRef,
        userId: user.id,
        subject,
        category,
        message,
        priority,
        status: 'OPEN',
        responses: JSON.stringify([]),
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create support ticket' }, { status: 500 });
  }
}

// Add response to ticket
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, replyMessage, newStatus } = body;

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const responses = JSON.parse(ticket.responses || '[]');
    if (replyMessage) {
      responses.push({
        senderName: user.name,
        senderRole: user.role,
        message: replyMessage,
        timestamp: new Date().toISOString(),
      });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        responses: JSON.stringify(responses),
        status: newStatus || (user.role === 'ADMIN' ? 'IN_PROGRESS' : ticket.status),
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reply to ticket' }, { status: 500 });
  }
}
