'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Award, 
  Building2, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Star, 
  Sparkles, 
  Sliders, 
  Clock, 
  FileText,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BusinessListing } from '@/lib/types';
import { CertificationBadge } from '@/components/ui/CertificationBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Modal } from '@/components/ui/Modal';
import { formatRwf } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [openTicketCount, setOpenTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audit modal state
  const [auditTarget, setAuditTarget] = useState<BusinessListing | null>(null);
  const [hospitalityScore, setHospitalityScore] = useState(25);
  const [cleanlinessScore, setCleanlinessScore] = useState(25);
  const [sustainabilityScore, setSustainabilityScore] = useState(23);
  const [facilitiesScore, setFacilitiesScore] = useState(24);
  const [inspectorNotes, setInspectorNotes] = useState('Impeccable Rwandan welcome with Amaraba tea, solar water heating verified.');
  const [submittingAudit, setSubmittingAudit] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState('');

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (data.businesses) {
        setBusinesses(data.businesses);
      }
    } catch (e) {
      console.error('Failed to load businesses for admin:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      if (data.tickets) {
        setOpenTicketCount(data.tickets.filter((t: any) => t.status !== 'RESOLVED').length);
      }
    } catch (e) {
      console.error('Failed to load support tickets for admin:', e);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchTickets();
  }, []);

  const auditedBusinesses = businesses.filter((b) => b.qualityScore != null);
  const platformQaAverage = auditedBusinesses.length
    ? auditedBusinesses.reduce((sum, b) => sum + (b.qualityScore || 0), 0) / auditedBusinesses.length
    : null;

  const totalScore = hospitalityScore + cleanlinessScore + sustainabilityScore + facilitiesScore;

  const handleExecuteAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditTarget) return;
    setSubmittingAudit(true);

    try {
      const res = await fetch('/api/quality-engine/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: auditTarget.id,
          score: totalScore,
          notes: inspectorNotes,
          inspectionItems: [
            { category: 'Hospitality & Service', score: hospitalityScore, max: 25 },
            { category: 'Cleanliness & Hygiene', score: cleanlinessScore, max: 25 },
            { category: 'Safety & Sustainability', score: sustainabilityScore, max: 25 },
            { category: 'Facilities & Comfort', score: facilitiesScore, max: 25 },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuditSuccess(`Audit passed! Granted Badge: ${data.audit.badgeGranted} with final score: ${data.audit.score}%`);
        fetchBusinesses();
        setTimeout(() => {
          setAuditSuccess('');
          setAuditTarget(null);
        }, 2500);
      } else {
        alert(data.error || 'Audit execution failed');
      }
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setSubmittingAudit(false);
    }
  };

  return (
    <div className="w-full space-y-10 pb-20">
      
      {/* Full-width Dark Header Banner (Clean, no eyebrow tag) */}
      <div className="w-full bg-gradient-to-b from-[#0B1B36] via-[#0D2240] to-[#0B1B36] text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Glowing Shapes */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Text as="h1" variant="h1" color="white" className="text-3xl sm:text-5xl">
              Chief QA & Auditor <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white">Dashboard</span>
            </Text>
            <Text variant="caption" className="text-xs sm:text-sm text-sky-100/90 font-medium">
              Logged in as {user?.name || 'Dr. Vanessa Uwase'} (RDB Senior Quality Inspector)
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white backdrop-blur-md">
              RDB Standard V1.0 Active
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Admin KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Verified Partners</span>
              <Building2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{businesses.length} Properties</div>
            <div className="text-[11px] text-sky-700 font-extrabold">
              {auditedBusinesses.length} of {businesses.length} Audited
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Gold Standard Venues</span>
              <Award className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {businesses.filter((b) => b.certificationBadge === 'GOLD_STANDARD').length} Venues
            </div>
            <div className="text-[11px] text-slate-500 font-medium">&gt; 95% QA Benchmark</div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Platform QA Average</span>
              <Star className="w-4 h-4 text-sky-600 fill-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {platformQaAverage !== null ? `${platformQaAverage.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {platformQaAverage !== null ? `Across ${auditedBusinesses.length} audited properties` : 'No audits recorded yet'}
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Support Tickets</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{openTicketCount} Unresolved</div>
            <div className="text-[11px] text-sky-700 font-extrabold">24/7 SLA Compliant</div>
          </Card>

        </div>

        {/* Property Audit Queue & Management Table */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Text as="h2" variant="h2" color="dark" className="text-2xl">
              Hospitality Quality Assurance Queue
            </Text>
            <span className="text-xs text-slate-500 font-bold">
              Click &quot;Conduct 40-Pt Audit&quot; to execute in-person audit scoring
            </span>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Property / Business</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Current Badge</th>
                    <th className="px-6 py-4">Audit Score</th>
                    <th className="px-6 py-4">Guest Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {businesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="text-sm font-extrabold">{b.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{b.type}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{b.location}, Rwanda</td>
                      <td className="px-6 py-4">
                        <CertificationBadge badge={b.certificationBadge} size="sm" />
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-sky-700">
                        {b.qualityScore != null ? `${b.qualityScore}%` : 'Pending'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900 font-bold">{b.ratingAvg.toFixed(2)}</span>
                        <span className="text-slate-400 text-[10px] ml-1 font-medium">({b.reviewCount})</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          type="button"
                          onClick={() => {
                            setAuditTarget(b);
                            setAuditSuccess('');
                          }}
                          variant="secondary"
                          size="sm"
                          className="!rounded-xl hover:!bg-sky-600 hover:!text-white"
                        >
                          Conduct 40-Pt Audit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* 40-Point QA Inspection Audit Modal */}
      <Modal
        open={!!auditTarget}
        onClose={() => setAuditTarget(null)}
        title={auditTarget?.name}
        size="lg"
        footer={
          !auditSuccess && auditTarget ? (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setAuditTarget(null)}
                variant="ghost"
                size="sm"
                className="bg-transparent border-none shadow-none text-slate-500 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="audit-form"
                isLoading={submittingAudit}
                variant="primary"
                size="sm"
                className="!rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:opacity-95"
              >
                {submittingAudit ? 'Publishing Audit...' : 'Publish Audit & Grant Badge'}
              </Button>
            </div>
          ) : null
        }
      >
        {auditTarget && (
            auditSuccess ? (
              <div className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-8 h-8 text-sky-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Quality Audit Calculated!</h4>
                <p className="text-xs text-sky-700 font-mono font-bold">{auditSuccess}</p>
              </div>
            ) : (
              <form id="audit-form" onSubmit={handleExecuteAudit} className="p-6 overflow-y-auto space-y-5">

                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Calculated QA Score</span>
                    <div className="text-2xl font-mono font-bold text-sky-900">{totalScore} / 100</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Badge</span>
                    <div className="text-xs font-bold text-sky-800 mt-1">
                      {totalScore >= 95 ? 'GOLD STANDARD CERTIFIED' : totalScore >= 80 ? 'LUXE VERIFIED' : 'PENDING'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>1. Traditional Rwandan Hospitality & Service</span>
                      <span className="text-sky-700 font-mono font-bold">{hospitalityScore} / 25 pts</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={hospitalityScore}
                      onChange={(e) => setHospitalityScore(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>2. Cleanliness & Sanitation</span>
                      <span className="text-sky-700 font-mono font-bold">{cleanlinessScore} / 25 pts</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={cleanlinessScore}
                      onChange={(e) => setCleanlinessScore(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>3. Eco & Gorilla Conservation Sustainability</span>
                      <span className="text-sky-700 font-mono font-bold">{sustainabilityScore} / 25 pts</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={sustainabilityScore}
                      onChange={(e) => setSustainabilityScore(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>4. Luxury Facilities, Starlink & Security</span>
                      <span className="text-sky-700 font-mono font-bold">{facilitiesScore} / 25 pts</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={facilitiesScore}
                      onChange={(e) => setFacilitiesScore(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Auditor Field Notes
                  </label>
                  <textarea
                    rows={2}
                    value={inspectorNotes}
                    onChange={(e) => setInspectorNotes(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

              </form>
            )
        )}
      </Modal>

    </div>
  );
}
