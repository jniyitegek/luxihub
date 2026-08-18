'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SupportTicketDto } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportTicketModal({ isOpen, onClose }: SupportModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'VIP_CONCIERGE' | 'BOOKING' | 'PAYMENT' | 'QA_DISPUTE'>('VIP_CONCIERGE');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'VIP'>('VIP');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen && user) {
      fetchTickets();
    }
  }, [isOpen, user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error('Failed to load tickets:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, message, priority }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Your inquiry #${data.ticket.ticketRef} has been dispatched to the 24/7 VIP Concierge desk.`);
        setSubject('');
        setMessage('');
        fetchTickets();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error('Submit ticket failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (ticketId: string) => {
    const text = replyText[ticketId];
    if (!text) return;
    try {
      const res = await fetch('/api/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, replyMessage: text }),
      });
      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
        fetchTickets();
      }
    } catch (e) {
      console.error('Reply failed:', e);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Higa Lux 24/7 VIP Concierge"
      subtitle="Direct assistance, helicopter charters & quality assurance"
      size="lg"
    >
        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'NEW' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            New VIP Inquiry
          </button>
          <button
            onClick={() => { setActiveTab('HISTORY'); fetchTickets(); }}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>My Active Requests</span>
            {tickets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-bold">
                {tickets.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'NEW' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="VIP_CONCIERGE">VIP Safari / Helicopter / Chef Request</option>
                    <option value="BOOKING">Booking Modification / Inquiries</option>
                    <option value="PAYMENT">MTN MoMo / Card Payment Support</option>
                    <option value="QA_DISPUTE">Quality Assurance Dispute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="VIP">VIP Priority (Immediate Response)</option>
                    <option value="HIGH">High Priority (&lt; 15 mins)</option>
                    <option value="MEDIUM">Standard</option>
                  </select>
                </div>
              </div>

              <Input
                label="Subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Akagera Aviation Helicopter transfer to Volcanoes NP"
                required
              />

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Detailed Request / Requirements
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your request, dates, passenger count, or dietary preferences..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:outline-none focus:border-sky-500 focus:bg-white placeholder-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  isLoading={submitting}
                  variant="primary"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="!rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:opacity-95 hover:scale-[1.01] active:scale-95"
                >
                  {submitting ? 'Transmitting...' : 'Send to VIP Concierge'}
                </Button>
              </div>

            </form>
          ) : (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs font-medium">
                  No active requests found. Submit a request to connect with our concierge.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-mono text-[10px] font-bold">
                          #{t.ticketRef}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {t.message}
                    </p>

                    {/* Responses Thread */}
                    {t.responses && t.responses.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        {t.responses.map((resp, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-sky-900 font-bold">
                              <span>{resp.senderName} ({resp.senderRole})</span>
                              <span className="text-[10px] text-slate-400 font-normal">{new Date(resp.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-700">{resp.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={replyText[t.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                          placeholder="Type reply..."
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleSendReply(t.id)}
                        variant="primary"
                        size="sm"
                        className="!rounded-xl hover:opacity-95"
                      >
                        Reply
                      </Button>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

        </div>

    </Modal>
  );
}
