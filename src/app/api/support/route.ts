import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { forbidden, handleRouteError, notFound, parseBody, requireUser } from '@/lib/api';
import { generateRef } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['BOOKING', 'PAYMENT', 'PARTNER_ONBOARDING', 'QA_DISPUTE', 'VIP_CONCIERGE'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'VIP'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

export async function GET() {
  try {
    const user = await requireUser();

    const tickets = await prisma.supportTicket.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({ ...t, responses: JSON.parse(t.responses || '[]') })),
    });
  } catch (error) {
    return handleRouteError(error, 'support GET');
  }
}

const createSchema = z.object({
  subject: z.string().trim().min(3, 'Add a short subject').max(160),
  message: z.string().trim().min(10, 'Tell us how we can help').max(4000),
  category: z.enum(CATEGORIES).default('BOOKING'),
  priority: z.enum(PRIORITIES).default('MEDIUM'),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(req, createSchema);

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketRef: generateRef('TICK'),
        userId: user.id,
        subject: input.subject,
        message: input.message,
        category: input.category,
        // Priority is a triage decision, not the reporter's to make; only the
        // concierge team can escalate a ticket to VIP.
        priority: user.role === 'ADMIN' ? input.priority : input.priority === 'VIP' ? 'HIGH' : input.priority,
        status: 'OPEN',
        responses: JSON.stringify([]),
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'support POST');
  }
}

const replySchema = z.object({
  ticketId: z.string().min(1),
  replyMessage: z.string().trim().min(1, 'Write a reply').max(4000),
  newStatus: z.enum(STATUSES).optional(),
});

/** Adds a message to a thread. Reporters may only reply on their own tickets. */
export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const { ticketId, replyMessage, newStatus } = await parseBody(req, replySchema);

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw notFound('Ticket not found');

    const isAdmin = user.role === 'ADMIN';
    if (!isAdmin && ticket.userId !== user.id) {
      throw forbidden('You do not have access to this ticket');
    }

    const responses = JSON.parse(ticket.responses || '[]');
    responses.push({
      senderName: user.name,
      senderRole: user.role,
      message: replyMessage,
      timestamp: new Date().toISOString(),
    });

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        responses: JSON.stringify(responses),
        // Only the concierge team moves a ticket through its workflow; a
        // reporter replying simply reopens it for attention.
        status: isAdmin ? (newStatus ?? 'IN_PROGRESS') : ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status,
      },
    });

    return NextResponse.json({ success: true, ticket: { ...updated, responses } });
  } catch (error) {
    return handleRouteError(error, 'support PATCH');
  }
}
