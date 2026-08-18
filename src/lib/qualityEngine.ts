import { CertificationBadge } from './types';

export interface InspectionCheckItem {
  id: string;
  category: 'Hospitality & Service' | 'Cleanliness & Hygiene' | 'Safety & Sustainability' | 'Facilities & Comfort';
  title: string;
  weight: number; // 1-10
  passed: boolean;
  notes?: string;
}

export const QA_STANDARDS_CHECKLIST: Omit<InspectionCheckItem, 'passed' | 'notes'>[] = [
  // Hospitality & Service
  { id: 'hs_1', category: 'Hospitality & Service', title: 'Warm Rwandan traditional welcoming (Amaraba tea / cold towel upon arrival)', weight: 8 },
  { id: 'hs_2', category: 'Hospitality & Service', title: 'Multilingual concierge (Kinyarwanda, English, French)', weight: 9 },
  { id: 'hs_3', category: 'Hospitality & Service', title: '24/7 Prompt guest responsiveness (< 5 minutes average response)', weight: 10 },
  { id: 'hs_4', category: 'Hospitality & Service', title: 'Certified sommelier and executive chef culinary curation', weight: 8 },
  { id: 'hs_5', category: 'Hospitality & Service', title: 'Personalized itinerary and safari briefing accuracy', weight: 9 },

  // Cleanliness & Hygiene
  { id: 'ch_1', category: 'Cleanliness & Hygiene', title: 'RDB / RDB-Hospitality standard grade 5 sanitation protocols', weight: 10 },
  { id: 'ch_2', category: 'Cleanliness & Hygiene', title: 'Daily high-thread linen change & hypoallergenic room misting', weight: 8 },
  { id: 'ch_3', category: 'Cleanliness & Hygiene', title: 'Pristine dining and kitchen open-door audit compliance', weight: 10 },
  { id: 'ch_4', category: 'Cleanliness & Hygiene', title: 'Purified water filtration & eco-glass bottling station', weight: 9 },

  // Safety & Sustainability
  { id: 'ss_1', category: 'Safety & Sustainability', title: 'Zero single-use plastic policy across all guest areas', weight: 10 },
  { id: 'ss_2', category: 'Safety & Sustainability', title: 'Community benefit revenue share (> 10% local employment / supply)', weight: 9 },
  { id: 'ss_3', category: 'Safety & Sustainability', title: 'Solar power / eco-friendly energy backup integration', weight: 8 },
  { id: 'ss_4', category: 'Safety & Sustainability', title: 'On-site medical first-response & mountain rescue linkage', weight: 9 },

  // Facilities & Comfort
  { id: 'fc_1', category: 'Facilities & Comfort', title: 'Ultra-high-speed fiber / Starlink satellite Wi-Fi in remote areas', weight: 8 },
  { id: 'fc_2', category: 'Facilities & Comfort', title: 'Signature panoramic views of Volcanoes / Lake Kivu / Rolling Hills', weight: 9 },
  { id: 'fc_3', category: 'Facilities & Comfort', title: 'Temperature-controlled climate / heated fireplace amenities', weight: 8 },
  { id: 'fc_4', category: 'Facilities & Comfort', title: 'Private luxury transport / 4x4 Land Cruiser safari readiness', weight: 9 },
];

export interface QualityAssessmentResult {
  overallScore: number; // 0 - 100
  recommendedBadge: CertificationBadge;
  categoryBreakdown: {
    hospitality: number;
    cleanliness: number;
    sustainability: number;
    facilities: number;
  };
  reviewSentimentScore: number;
  responseRateScore: number;
  badgeStatus: 'QUALIFIED' | 'NEEDS_IMPROVEMENT' | 'REVOKED';
  keyInsights: string[];
}

export function evaluateBusinessQuality(params: {
  reviewCount: number;
  ratingAvg: number;
  cleanlinessAvg: number;
  serviceAvg: number;
  hospitalityAvg: number;
  responseRate: number;
  auditChecklistScore?: number;
}): QualityAssessmentResult {
  const {
    reviewCount,
    ratingAvg,
    cleanlinessAvg,
    serviceAvg,
    hospitalityAvg,
    responseRate,
    auditChecklistScore = 94,
  } = params;

  // Normalized review score (out of 100)
  const reviewScore = (ratingAvg / 5) * 100;
  const cleanlinessScore = (cleanlinessAvg / 5) * 100;
  const serviceScore = (serviceAvg / 5) * 100;
  const hospitalityScore = (hospitalityAvg / 5) * 100;

  // Weighted overall calculation:
  // 40% In-person QA Audit, 35% Customer Reviews, 15% Response Rate, 10% Service Consistency
  const overallScore = Math.round(
    auditChecklistScore * 0.40 +
    reviewScore * 0.35 +
    responseRate * 0.15 +
    ((cleanlinessScore + hospitalityScore + serviceScore) / 3) * 0.10
  );

  let recommendedBadge: CertificationBadge = 'NONE';
  let badgeStatus: 'QUALIFIED' | 'NEEDS_IMPROVEMENT' | 'REVOKED' = 'QUALIFIED';
  const keyInsights: string[] = [];

  if (overallScore >= 92 && reviewCount >= 3 && responseRate >= 95) {
    recommendedBadge = 'GOLD_STANDARD';
    keyInsights.push('Meets highest echelon Rwandan luxury standards with exemplary guest satisfaction.');
    keyInsights.push('Recommended for Higa Lux Hero Spotlight and VIP Concierge Priority.');
  } else if (overallScore >= 80) {
    recommendedBadge = 'LUXE_VERIFIED';
    keyInsights.push('Passed verified 40-point inspection and complies with verified booking standards.');
  } else if (overallScore >= 70) {
    recommendedBadge = 'ECO_SUSTAINABLE';
    keyInsights.push('Qualified under Eco-Tourism and Sustainable Rwandan Heritage criteria.');
  } else {
    recommendedBadge = 'NONE';
    badgeStatus = 'NEEDS_IMPROVEMENT';
    keyInsights.push('Action Plan Required: Response rate and review averages require remediation before badge issuance.');
  }

  return {
    overallScore,
    recommendedBadge,
    categoryBreakdown: {
      hospitality: Math.round(hospitalityScore),
      cleanliness: Math.round(cleanlinessScore),
      sustainability: Math.round(auditChecklistScore * 0.96),
      facilities: Math.round((serviceScore + auditChecklistScore) / 2),
    },
    reviewSentimentScore: Math.round(reviewScore),
    responseRateScore: responseRate,
    badgeStatus,
    keyInsights,
  };
}
