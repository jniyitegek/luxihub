import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Higa Lux database seeding with Rwandan luxury hospitality dataset...');

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error(
      'Refusing to seed a production database. This script deletes every record first. ' +
        'Set ALLOW_PRODUCTION_SEED=true only if that is genuinely what you intend.'
    );
  }

  // 1. Clean existing records
  await prisma.serviceRating.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceOffering.deleteMany();
  await prisma.qAAudit.deleteMany();
  await prisma.trainingEnrollment.deleteMany();
  await prisma.trainingCourse.deleteMany();
  await prisma.partnerSubscription.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // Demo credentials. Override with SEED_PASSWORD when seeding a shared
  // staging environment so the published password is not the live one.
  const seedPassword = process.env.SEED_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(seedPassword, 12);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@higalux.rw',
      passwordHash,
      name: 'Dr. Vanessa Uwase',
      role: 'ADMIN',
      phone: '+250 788 999 000',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
  });

  const partner1 = await prisma.user.create({
    data: {
      email: 'partner@retreat.rw',
      passwordHash,
      name: 'Jean-Paul Nsengiyumva',
      role: 'PARTNER',
      phone: '+250 788 654 321',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  const partner2 = await prisma.user.create({
    data: {
      email: 'partner@bisate.rw',
      passwordHash,
      name: 'Alphonse Bizimana',
      role: 'PARTNER',
      phone: '+250 788 777 888',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@higalux.rw',
      passwordHash,
      name: 'Clarisse Mutoni',
      role: 'CUSTOMER',
      phone: '+250 788 123 456',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'sarah.jenkins@luxurytravelexec.com',
      passwordHash,
      name: 'Sarah Jenkins',
      role: 'CUSTOMER',
      phone: '+1 415 890 1234',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    },
  });

  console.log('✅ Created Users');

  // 3. Create Businesses
  const theRetreat = await prisma.business.create({
    data: {
      ownerId: partner1.id,
      name: 'The Retreat by Heaven',
      slug: 'the-retreat-kigali',
      type: 'HOTEL',
      location: 'Kigali',
      address: 'KN 29 St, Kiyovu, Kigali, Rwanda',
      description: "Kigali's premier 5-star boutique eco-luxury resort. Nestled in lush private gardens in Kiyovu, featuring solar power, saltwater heated pool, outdoor rain showers, bespoke custom teak woodwork, organic farm-to-fork culinary excellence, and holistic wellness spa pavilions.",
      shortTagline: '5-Star Boutique Eco-Sanctuary in the Heart of Kigali',
      amenities: JSON.stringify([
        'Solar Powered Eco-Lodge',
        'Saltwater Heated Swimming Pool',
        'Private Teak Terraces',
        'Organic Farm-to-Table Dining',
        'Full Holistic Spa & Sauna',
        'High-Speed Starlink Wi-Fi',
        'Airport Luxury Chauffeur',
        '24/7 Butler Service'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 650000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'GOLD_STANDARD',
      ratingAvg: 4.95,
      reviewCount: 42,
      isFeatured: true,
      phone: '+250 782 000 001',
      email: 'reservations@the-retreat.rw',
      website: 'https://www.the-retreat.rw',
      responseRate: 100,
      subscriptionTier: 'ELITE',
    },
  });

  const bisate = await prisma.business.create({
    data: {
      ownerId: partner2.id,
      name: 'Bisate Lodge by Wilderness',
      slug: 'bisate-lodge-musanze',
      type: 'HOTEL',
      location: 'Musanze',
      address: 'Volcanoes National Park Buffer Zone, Kinigi, Musanze',
      description: "Perched dramatically on the slopes of an eroded volcanic cone, Bisate Lodge features award-winning woven spherical thatch villas inspired by Rwandan royal palace architecture. Unrivaled panoramic vistas of Mount Bisoke and Mount Karisimbi, world-class gorilla trekking hospitality, and pioneering indigenous reforestation.",
      shortTagline: 'Iconic Volcanic Sanctuary & Gorilla Trekking Haven',
      amenities: JSON.stringify([
        'Spherical Luxury Forest Villa',
        'Volcano Peak Panoramic Fireplaces',
        'Private Wine Cellar & Sommelier',
        'Gorilla Trekking Concierge & Boot Cleaning',
        'Pioneering Tree Planting Program',
        'Eco-Luxury Zero Single-Use Plastic',
        'Helipad Access',
        'All-Inclusive Fine Dining'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 1850000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'GOLD_STANDARD',
      ratingAvg: 4.98,
      reviewCount: 38,
      isFeatured: true,
      phone: '+250 782 000 002',
      email: 'concierge@bisaterwanda.com',
      website: 'https://wilderness-destinations.com/africa/rwanda/bisate-lodge',
      responseRate: 99,
    },
  });

  const cleoLakeKivu = await prisma.business.create({
    data: {
      ownerId: partner1.id,
      name: 'Cleo Lake Kivu Hotel',
      slug: 'cleo-lake-kivu-karongi',
      type: 'HOTEL',
      location: 'Rubavu',
      address: 'Bisesero Hills Waterfront, Karongi, Lake Kivu, Rwanda',
      description: "An ultra-exclusive private sanctuary suspended over the shimmering sapphire waters of Lake Kivu. Featuring infinity pools that merge with the lake horizon, private speedboat excursions to Napoleon Island, helicopter arrival pad, and Mediterranean-Rwandan fusion dining.",
      shortTagline: 'Ultra-Luxury Waterfront Peninsula Estate on Lake Kivu',
      amenities: JSON.stringify([
        'Private Lake Peninsula Beach',
        'Horizon Edge Heated Infinity Pool',
        'Private Yacht & Speedboat Tours',
        'Helipad Landing Facility',
        'Private Sunset Cocktail Deck',
        'Waterfront Suites with Jacuzzi',
        'Kayaking & Water Sports'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 950000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'LUXE_VERIFIED',
      ratingAvg: 4.91,
      reviewCount: 29,
      isFeatured: true,
      phone: '+250 782 000 003',
      email: 'stay@cleolakekivu.com',
      website: 'https://cleolakekivu.com',
      responseRate: 97,
    },
  });

  const oneAndOnlyNyungwe = await prisma.business.create({
    data: {
      ownerId: partner2.id,
      name: 'One&Only Nyungwe House',
      slug: 'one-and-only-nyungwe',
      type: 'HOTEL',
      location: 'Nyungwe',
      address: 'Gisakura Tea Estate, Nyungwe National Park, Rwanda',
      description: "Immersed in an emerald working tea plantation bordering the ancient Nyungwe rain forest canopy. An extraordinary wellness retreat offering private forest suites with open fireplaces, chimpanzee tracking, canopy walk transfers, and restorative holistic tea-infused spa rituals.",
      shortTagline: 'Rainforest Canopy Sanctuary & Working Tea Estate',
      amenities: JSON.stringify([
        'Tea Plantation Private Villas',
        'Rainforest Horizon Infinity Pool',
        'Africology Holistic Spa',
        'Chimpanzee Tracking Ranger Concierge',
        'Helicopter Transfer Hub',
        'Private Canopy Firepit Lounges'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 1950000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'GOLD_STANDARD',
      ratingAvg: 4.96,
      reviewCount: 31,
      isFeatured: true,
      phone: '+250 782 000 004',
      email: 'reservations@oneandonlynyungwehouse.com',
      responseRate: 100,
    },
  });

  const fusionRestaurant = await prisma.business.create({
    data: {
      ownerId: partner1.id,
      name: 'Fusion Restaurant & Lounge',
      slug: 'fusion-restaurant-kigali',
      type: 'RESTAURANT',
      location: 'Kigali',
      address: 'KN 29 St, Kiyovu, Kigali, Rwanda',
      description: "Fine dining restaurant combining indigenous Rwandan and East African ingredients with classical French and Italian culinary techniques. Set beside a glowing saltwater pool under the Kigali starlit sky.",
      shortTagline: 'Exquisite African-European Fine Dining & Curated Cellar',
      amenities: JSON.stringify([
        'Poolside Starlit Cabana Dining',
        '7-Course Rwandan Tasting Menu',
        'Certified Sommelier Wine Pairings',
        'Live Acoustic Rwandan Inanga Nights',
        'Organic Certified Produce',
        'Private Chef Table'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$',
      basePrice: 65000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'GOLD_STANDARD',
      ratingAvg: 4.92,
      reviewCount: 56,
      isFeatured: true,
      phone: '+250 782 000 005',
      email: 'dining@the-retreat.rw',
      responseRate: 98,
    },
  });

  const mezaMalonga = await prisma.business.create({
    data: {
      ownerId: partner1.id,
      name: 'Meza Malonga Culinary Lab',
      slug: 'meza-malonga-kigali',
      type: 'RESTAURANT',
      location: 'Kigali',
      address: 'KG 566 St, Nyarutarama, Kigali, Rwanda',
      description: "Internationally acclaimed Afro-fusion fine dining institution founded by Chef Dieuveil Malonga. An immersive 10-course gastronomic safari celebrating indigenous African grains, herbs, and sustainably sourced terroir.",
      shortTagline: 'World-Renowned Afro-Fusion Gastronomy Tasting Experience',
      amenities: JSON.stringify([
        '10-Course Terroir Gastronomic Safari',
        'Open Kitchen Chef Interaction',
        'Bespoke African Spirit Pairings',
        'VIP Table Reservations',
        'Private Dining Room'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 120000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'GOLD_STANDARD',
      ratingAvg: 4.97,
      reviewCount: 64,
      isFeatured: true,
      phone: '+250 782 000 006',
      email: 'table@mezamalonga.com',
      responseRate: 100,
    },
  });

  const gorillaExpedition = await prisma.business.create({
    data: {
      ownerId: partner2.id,
      name: 'Volcanoes VIP Mountain Gorilla Safari',
      slug: 'gorilla-trekking-expedition-musanze',
      type: 'TOUR',
      location: 'Musanze',
      address: 'Kinigi Headquarters, Volcanoes National Park',
      description: "Exclusive, certified mountain gorilla trekking & golden monkey tracking expeditions with senior park rangers, private luxury 4x4 Land Cruisers, gourmet safari hampers, and complete permit logistics handling.",
      shortTagline: 'VIP Guided Mountain Gorilla & Conservation Safari',
      amenities: JSON.stringify([
        'Official RDB Permit VIP Processing',
        'Private Expert Senior Wildlife Ranger',
        'Custom 4x4 Extended Safari Land Cruiser',
        'Artisanal Gourmet Bush Picnic Hamper',
        'Professional Trekking Porter & Gear Pack',
        'Post-Trek Foot Reflexology Massage Voucher'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 1950000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'ECO_SUSTAINABLE',
      ratingAvg: 4.99,
      reviewCount: 78,
      isFeatured: true,
      phone: '+250 782 000 007',
      email: 'expeditions@higalux.rw',
      responseRate: 100,
    },
  });

  const akageraCamp = await prisma.business.create({
    data: {
      ownerId: partner2.id,
      name: 'Magashi Luxury Tented Camp',
      slug: 'magashi-camp-akagera',
      type: 'HOTEL',
      location: 'Akagera',
      address: 'Lake Rwanyakazinga Peninsula, Akagera National Park',
      description: "Rwanda's only ultra-luxury safari camp inside the private wilderness area of Akagera National Park. Overlooking Lake Rwanyakazinga, home to the Big Five, boat safaris, night game drives, and starlit campfire bomas.",
      shortTagline: 'Big Five Safari Luxury Camp on Lake Rwanyakazinga',
      amenities: JSON.stringify([
        'Waterfront Luxury Canvas Tent Suite',
        'Private Boat Safari Excursions',
        'Exclusive Big 5 Game Drives',
        'Lakeview Swimming Pool',
        'Campfire Traditional Boma Dinners',
        'Open Safari Bar & Cellar'
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80'
      ]),
      pricingTier: '$$$$',
      basePrice: 1400000,
      currency: 'RWF',
      status: 'VERIFIED',
      certificationBadge: 'GOLD_STANDARD',
      ratingAvg: 4.93,
      reviewCount: 22,
      isFeatured: true,
      phone: '+250 782 000 008',
      email: 'safari@magashicamp.rw',
      responseRate: 98,
    },
  });

  console.log('✅ Created Businesses');

  // 4. Create Service Offerings
  const retreatVilla = await prisma.serviceOffering.create({
    data: {
      businessId: theRetreat.id,
      title: 'Luxury Master Pool Villa with Private Garden',
      description: 'Expansive 120m² master villa featuring private solar-heated plunge pool, custom king teak bed, indoor-outdoor bathroom with freestanding copper bath, and private butler service.',
      capacity: 2,
      price: 650000,
      currency: 'RWF',
      unit: 'per_night',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
      ]),
      inclusions: JSON.stringify([
        'Full gourmet à la carte breakfast',
        'Airport VIP round-trip transfer',
        'Daily 60-min holistic massage for two',
        'Complimentary laundry service',
        'Daily stocked premium mini-bar'
      ]),
      isAvailable: true,
    },
  });

  const retreatSuite = await prisma.serviceOffering.create({
    data: {
      businessId: theRetreat.id,
      title: 'Superior Garden Sanctuary Suite',
      description: 'Lush garden view suite with private teak veranda, outdoor rain shower, organic linen, and custom Rwandan craftsmanship.',
      capacity: 2,
      price: 450000,
      currency: 'RWF',
      unit: 'per_night',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80'
      ]),
      inclusions: JSON.stringify([
        'Gourmet breakfast',
        'High-speed Starlink Wi-Fi',
        'Gym & Heated Saltwater Pool access'
      ]),
      isAvailable: true,
    },
  });

  const bisateVilla = await prisma.serviceOffering.create({
    data: {
      businessId: bisate.id,
      title: 'Iconic Volcanic Forest Villa Suite',
      description: 'Sensational 91m² woven thatch royal villa with central fireplace, panoramic volcanic peak deck, soaking tub, and dedicated butler.',
      capacity: 2,
      price: 1850000,
      currency: 'RWF',
      unit: 'per_night',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80'
      ]),
      inclusions: JSON.stringify([
        'All meals, artisanal snacks & premium wines/spirits',
        'Private guide & tracking prep briefing',
        'Complimentary gorilla trekking gear & gaiters',
        'Lodge reforestation tree planting experience'
      ]),
      isAvailable: true,
    },
  });

  const fusionTasting = await prisma.serviceOffering.create({
    data: {
      businessId: fusionRestaurant.id,
      title: '7-Course African Terroir Degustation Menu for Two',
      description: 'Seven-course gastronomic voyage featuring Lake Kivu sambaza tartare, Virunga honey duck breast, and Nyungwe mountain tea sorbet with sommelier wine pairing.',
      capacity: 2,
      price: 130000,
      currency: 'RWF',
      unit: 'per_table',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80'
      ]),
      inclusions: JSON.stringify([
        '7-course tasting menu',
        'Sommelier reserve wine flight pairing',
        'Welcome glass of champagne',
        'Complimentary artisan gift box'
      ]),
      isAvailable: true,
    },
  });

  const gorillaTourPkg = await prisma.serviceOffering.create({
    data: {
      businessId: gorillaExpedition.id,
      title: 'Full-Day VIP Gorilla Trekking & Luxury Expedition Package',
      description: 'Complete guided expedition with senior wildlife ranger, luxury 4x4 private Land Cruiser, park orientation, gourmet bush lunch, and trek escort.',
      capacity: 4,
      price: 1950000,
      currency: 'RWF',
      unit: 'per_tour',
      duration: '1 Full Day (10 hours)',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1000&q=80'
      ]),
      inclusions: JSON.stringify([
        'Official park entry & VIP ranger coordination',
        'Private 4x4 luxury safari vehicle with Wi-Fi & refreshments',
        'Gourmet picnic hamper & mineral water',
        'Personal trekking porter support',
        'High-resolution commemorative photography guide'
      ]),
      isAvailable: true,
    },
  });

  const mezaTasting = await prisma.serviceOffering.create({
    data: {
      businessId: mezaMalonga.id,
      title: '10-Course Afro-Fusion Gastronomic Safari for Two',
      description:
        'Chef Dieuveil Malonga\'s signature ten-course journey through indigenous African grains, herbs and sustainably sourced terroir, served at the open kitchen counter.',
      capacity: 2,
      price: 240000,
      currency: 'RWF',
      unit: 'per_table',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80'
      ]),
      inclusions: JSON.stringify([
        '10-course tasting menu',
        'Bespoke African spirit and wine pairings',
        'Welcome aperitif at the chef\'s counter',
        'Signed menu card'
      ]),
      isAvailable: true,
    },
  });

  console.log('✅ Created Service Offerings');

  // 5. Create Sample Bookings & Payments
  const booking1 = await prisma.booking.create({
    data: {
      bookingRef: 'LUX-2026-882194',
      customerId: customer1.id,
      businessId: theRetreat.id,
      serviceOfferingId: retreatVilla.id,
      checkInDate: new Date('2026-08-15'),
      checkOutDate: new Date('2026-08-18'),
      guests: 2,
      totalAmount: 1950000,
      depositAmount: 585000,
      commissionAmount: 195000,
      payoutAmount: 1755000,
      currency: 'RWF',
      status: 'CONFIRMED',
      paymentStatus: 'FULLY_PAID',
      specialRequests: 'Celebrating 5th anniversary. Would appreciate flower arrangement in villa upon arrival.',
      guestName: 'Clarisse Mutoni',
      guestEmail: 'customer@higalux.rw',
      guestPhone: '+250 788 123 456',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      transactionRef: 'PAY-MTN-9988127364',
      provider: 'MTN_MOMO',
      amount: 1950000,
      currency: 'RWF',
      status: 'SUCCESS',
      payerPhone: '+250 788 123 456',
      channelResponse: '{"status":"APPROVED","txId":"MTN_RW_8899128"}',
      paidAt: new Date(),
    },
  });

  const bookingCompleted = await prisma.booking.create({
    data: {
      bookingRef: 'LUX-2026-441920',
      customerId: customer1.id,
      businessId: theRetreat.id,
      serviceOfferingId: retreatSuite.id,
      checkInDate: new Date('2026-07-10'),
      checkOutDate: new Date('2026-07-13'),
      guests: 2,
      totalAmount: 1350000,
      depositAmount: 1350000,
      commissionAmount: 135000,
      payoutAmount: 1215000,
      currency: 'RWF',
      status: 'COMPLETED',
      paymentStatus: 'FULLY_PAID',
      specialRequests: 'Airport pickup requested at 8:00 PM.',
      guestName: 'Clarisse Mutoni',
      guestEmail: 'customer@higalux.rw',
      guestPhone: '+250 788 123 456',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bookingCompleted.id,
      transactionRef: 'PAY-CARD-4421098811',
      provider: 'CARD',
      amount: 1350000,
      currency: 'RWF',
      status: 'SUCCESS',
      payerPhone: '+250 788 123 456',
      channelResponse: '{"status":"CHARGED","last4":"4242"}',
      paidAt: new Date('2026-07-09'),
    },
  });

  // 6. Verified Review for completed booking
  await prisma.review.create({
    data: {
      bookingId: bookingCompleted.id,
      businessId: theRetreat.id,
      customerId: customer1.id,
      rating: 5,
      cleanlinessRating: 5,
      serviceRating: 5,
      hospitalityRating: 5,
      valueRating: 5,
      title: 'An unforgettable oasis of peace and Rwandan luxury!',
      comment: 'From the warm greeting with Amaraba tea to the exquisite farm-to-table breakfast by the saltwater pool, our stay at The Retreat was flawless. The staff anticipated every need and the attention to detail is truly world-class.',
      partnerReply: 'Murakoze cyane Clarisse! It was an absolute delight hosting you, and our team cannot wait to welcome you back to your Kigali home.',
      partnerRepliedAt: new Date('2026-07-15'),
      isVerified: true,
    },
  });

  const bisateCompleted = await prisma.booking.create({
    data: {
      bookingRef: 'LUX-2026-556301',
      customerId: customer2.id,
      businessId: bisate.id,
      serviceOfferingId: bisateVilla.id,
      checkInDate: new Date('2026-06-12'),
      checkOutDate: new Date('2026-06-15'),
      guests: 2,
      totalAmount: 5550000,
      depositAmount: 5550000,
      commissionAmount: 555000,
      payoutAmount: 4995000,
      currency: 'RWF',
      status: 'COMPLETED',
      paymentStatus: 'FULLY_PAID',
      specialRequests: 'Gorilla trek scheduled for the second morning; vegetarian menu please.',
      guestName: 'Sarah Jenkins',
      guestEmail: 'sarah.jenkins@luxurytravelexec.com',
      guestPhone: '+1 415 890 1234',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: bisateCompleted.id,
      transactionRef: 'PAY-CARD-7781204455',
      provider: 'CARD',
      amount: 5550000,
      currency: 'RWF',
      status: 'SUCCESS',
      providerRef: 'FLW_REF_7781204455',
      payerPhone: '+1 415 890 1234',
      channelResponse: '{"status":"SUCCESS","processor_response":"Approved"}',
      paidAt: new Date('2026-06-01'),
    },
  });

  await prisma.review.create({
    data: {
      bookingId: bisateCompleted.id,
      businessId: bisate.id,
      customerId: customer2.id,
      rating: 5,
      cleanlinessRating: 5,
      serviceRating: 5,
      hospitalityRating: 5,
      valueRating: 5,
      title: 'Priceless gorilla trekking experience and royal hospitality',
      comment:
        'The spherical villas with views of Mount Bisoke take your breath away. The lodge team organized our gorilla trek effortlessly and had warm fireplace cocktails ready upon our return. 100% deserves the Gold Standard badge.',
      partnerReply:
        'Thank you Sarah! Protecting the volcanic mountain gorillas while delivering unmatched Rwandan warmth is our life passion.',
      partnerRepliedAt: new Date('2026-06-18'),
      isVerified: true,
    },
  });

  const mezaCompleted = await prisma.booking.create({
    data: {
      bookingRef: 'LUX-2026-337742',
      customerId: customer1.id,
      businessId: mezaMalonga.id,
      serviceOfferingId: mezaTasting.id,
      checkInDate: new Date('2026-07-22'),
      checkOutDate: new Date('2026-07-22'),
      guests: 2,
      totalAmount: 240000,
      depositAmount: 240000,
      commissionAmount: 24000,
      payoutAmount: 216000,
      currency: 'RWF',
      status: 'COMPLETED',
      paymentStatus: 'FULLY_PAID',
      guestName: 'Clarisse Mutoni',
      guestEmail: 'customer@higalux.rw',
      guestPhone: '+250 788 123 456',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: mezaCompleted.id,
      transactionRef: 'PAY-MTN-5520093311',
      provider: 'MTN_MOMO',
      amount: 240000,
      currency: 'RWF',
      status: 'SUCCESS',
      providerRef: 'MTN_RW_5520093311',
      payerPhone: '+250 788 123 456',
      channelResponse: '{"status":"SUCCESSFUL","financialTransactionId":"5520093311"}',
      paidAt: new Date('2026-07-22'),
    },
  });

  await prisma.review.create({
    data: {
      bookingId: mezaCompleted.id,
      businessId: mezaMalonga.id,
      customerId: customer1.id,
      rating: 5,
      cleanlinessRating: 5,
      serviceRating: 5,
      hospitalityRating: 5,
      valueRating: 4,
      title: 'A 10-course culinary masterwork of African terroir',
      comment:
        'Chef Dieuveil Malonga has created something peerless. The indigenous grain pairings and Rwandan artisanal spirit flights were on par with 3-star Michelin establishments in Europe.',
      partnerReply: 'Merci Clarisse! Celebrating African gastronomy at the highest echelon is our collective mission.',
      partnerRepliedAt: new Date('2026-07-26'),
      isVerified: true,
    },
  });

  // 7. QA Audits
  await prisma.qAAudit.create({
    data: {
      businessId: theRetreat.id,
      auditorName: 'Dr. Vanessa Uwase',
      score: 98,
      badgeGranted: 'GOLD_STANDARD',
      notes: 'Exceptional audit performance. Solar micro-grid fully operational. Hygiene inspection 100% compliant. Staff demonstrates mastery of Rwandan cultural hospitality and VIP guest handling.',
      inspectionItems: JSON.stringify([
        { category: 'Hospitality & Service', item: 'Warm Rwandan traditional welcoming', passed: true, score: 10 },
        { category: 'Cleanliness & Hygiene', item: 'RDB Grade 5 sanitation protocols', passed: true, score: 10 },
        { category: 'Safety & Sustainability', item: 'Zero single-use plastic & Solar power', passed: true, score: 10 },
        { category: 'Facilities & Comfort', item: 'High-speed Starlink Wi-Fi & Heated Pool', passed: true, score: 9.5 }
      ]),
      auditDate: new Date('2026-06-20'),
    },
  });

  await prisma.qAAudit.create({
    data: {
      businessId: bisate.id,
      auditorName: 'Dr. Vanessa Uwase',
      score: 99,
      badgeGranted: 'GOLD_STANDARD',
      notes: 'Pinnacle of eco-sustainable luxury in Africa. Outstanding reforestation effort and community profit sharing.',
      inspectionItems: JSON.stringify([
        { category: 'Hospitality & Service', item: 'Personalized gorilla trekking concierge', passed: true, score: 10 },
        { category: 'Cleanliness & Hygiene', item: 'Villa sanitation and hypoallergenic air filters', passed: true, score: 10 },
        { category: 'Safety & Sustainability', item: 'Zero carbon footprint & community partnership', passed: true, score: 10 }
      ]),
      auditDate: new Date('2026-07-05'),
    },
  });

  // 8. Hospitality Academy Courses
  const course1 = await prisma.trainingCourse.create({
    data: {
      title: 'Rwandan Silver Service & VIP Guest Protocol',
      slug: 'rwandan-silver-service-masterclass',
      category: 'SILVER_SERVICE',
      duration: '2 Weeks (Intensive)',
      price: 350000,
      currency: 'RWF',
      instructor: 'Chef Dieuveil Malonga & Maître D’ Jean-Paul',
      instructorBio: 'Michelin-experienced luxury hospitality directors with over 20 years in high-end culinary and concierge service.',
      description: 'Master the nuances of elite Rwandan luxury hospitality, formal five-star table settings, diplomatic etiquette, discreet guest attention, and high-stakes dispute de-escalation.',
      modules: JSON.stringify([
        'Rwandan Cultural Hospitality & Welcoming Arts',
        'Five-Star Formal Table Setup & Silver Service Dynamics',
        'VIP Concierge Discretion & High-Profile Protocol',
        'Sommelier Cellar Handling & Wine Pairings'
      ]),
      level: 'Executive Masterclass',
      rating: 4.95,
      enrolledCount: 142,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    },
  });

  const course2 = await prisma.trainingCourse.create({
    data: {
      title: 'Eco-Tourism & Volcano Conservation Standards',
      slug: 'eco-tourism-volcano-conservation',
      category: 'ECO_TOURISM',
      duration: '1 Week',
      price: 250000,
      currency: 'RWF',
      instructor: 'Dr. Eugene Kayitare',
      instructorBio: 'Senior Primatologist & Sustainable Tourism Consultant to RDB and African Wildlife Foundation.',
      description: 'Comprehensive certification on sustainable tourism compliance, gorilla habitat protection etiquette, zero-waste lodge operations, and carbon footprint reduction.',
      modules: JSON.stringify([
        'Mountain Gorilla Habitat Regulations & Etiquette',
        'Zero Single-Use Plastic Implementation Strategies',
        'Community Revenue Sharing Frameworks',
        'Emergency Wilderness First Response'
      ]),
      level: 'Advanced Certificate',
      rating: 4.98,
      enrolledCount: 96,
      image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    },
  });

  // 9. Partner Subscriptions
  await prisma.partnerSubscription.create({
    data: {
      businessId: theRetreat.id,
      planTier: 'ELITE',
      billingCycle: 'ANNUAL',
      price: 4500000,
      currency: 'RWF',
      status: 'ACTIVE',
      nextBillingDate: new Date('2027-01-01'),
      perks: JSON.stringify([
        'Gold Standard Certification Badge',
        'Homepage Hero Carousel Placement',
        'Zero Commission on Direct Higa Lux Bookings',
        'Quarterly In-Person QA Audit & Staff Training Pass',
        'Dedicated VIP Concierge Priority Routing'
      ]),
    },
  });

  // 10. Support Tickets
  await prisma.supportTicket.create({
    data: {
      ticketRef: 'TICK-2026-9021',
      userId: customer1.id,
      subject: 'Helicopter transfer inquiry from Kigali to Bisate Lodge',
      category: 'VIP_CONCIERGE',
      message: 'Hello Higa Lux Concierge, could you arrange an Akagera Aviation direct helicopter transfer from Kigali International Airport to Bisate Lodge for our arrival on August 15?',
      status: 'IN_PROGRESS',
      priority: 'VIP',
      responses: JSON.stringify([
        {
          senderName: 'Higa Lux VIP Concierge',
          senderRole: 'ADMIN',
          message: 'Muraho Clarisse, we have coordinated with Akagera Aviation. The private Airbus H125 helicopter flight is pre-booked for 2:30 PM departure from Kigali. We will send the flight manifest confirmation shortly.',
          timestamp: '2026-08-04T10:30:00Z',
        }
      ]),
    },
  });

  // 11. Recompute rating aggregates from the reviews that actually exist, so no
  // listing advertises a review count it cannot show.
  for (const business of await prisma.business.findMany({ select: { id: true } })) {
    const stats = await prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.business.update({
      where: { id: business.id },
      data: {
        ratingAvg: Number((stats._avg.rating ?? 0).toFixed(2)),
        reviewCount: stats._count._all,
      },
    });
  }

  console.log('✅ Recomputed rating aggregates from seeded reviews');

  console.log('🎉 Higa Lux database seeding completed successfully!');
  console.log(`   Demo sign-in password: ${seedPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
