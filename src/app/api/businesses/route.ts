import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const badge = searchParams.get('badge');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featuredOnly = searchParams.get('featured') === 'true';

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { location: { contains: query } },
        { address: { contains: query } },
      ];
    }

    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    if (location && location !== 'ALL') {
      whereClause.location = location;
    }

    if (badge && badge !== 'ALL') {
      whereClause.certificationBadge = badge;
    }

    if (featuredOnly) {
      whereClause.isFeatured = true;
      whereClause.AND = [
        ...(whereClause.AND || []),
        { OR: [{ featuredUntil: null }, { featuredUntil: { gte: new Date() } }] },
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.basePrice = {};
      if (minPrice) whereClause.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.basePrice.lte = parseFloat(maxPrice);
    }

    const businesses = await prisma.business.findMany({
      where: whereClause,
      include: {
        offerings: true,
        reviews: {
          take: 3,
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
      orderBy: [{ isFeatured: 'desc' }, { ratingAvg: 'desc' }],
    });

    const formatted = businesses.map((b) => {
      const { audits, ...rest } = b;
      return {
        ...rest,
        amenities: JSON.parse(b.amenities || '[]'),
        images: JSON.parse(b.images || '[]'),
        qualityScore: audits[0]?.score ?? null,
        offerings: b.offerings.map((o) => ({
          ...o,
          images: JSON.parse(o.images || '[]'),
          inclusions: JSON.parse(o.inclusions || '[]'),
        })),
      };
    });

    return NextResponse.json({ success: true, businesses: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch businesses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Partner or Admin role required.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      type,
      location,
      address,
      description,
      shortTagline,
      amenities,
      images,
      pricingTier,
      basePrice,
      currency = 'RWF',
      phone,
      email,
      website,
    } = body;

    if (!name || !type || !location || !address || !description) {
      return NextResponse.json({ error: 'Missing required business listing fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const newBusiness = await prisma.business.create({
      data: {
        ownerId: user.id,
        name,
        slug,
        type,
        location,
        address,
        description,
        shortTagline: shortTagline || `${type} in ${location}, Rwanda`,
        amenities: JSON.stringify(amenities || []),
        images: JSON.stringify(images || [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricingTier: pricingTier || '$$$',
        basePrice: parseFloat(basePrice) || 150000,
        currency,
        status: user.role === 'ADMIN' ? 'VERIFIED' : 'PENDING',
        certificationBadge: user.role === 'ADMIN' ? 'LUXE_VERIFIED' : 'NONE',
        phone: phone || user.phone,
        email: email || user.email,
        website: website || '',
      },
    });

    return NextResponse.json({ success: true, business: newBusiness });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create business listing' }, { status: 500 });
  }
}
