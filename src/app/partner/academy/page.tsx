'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award,
  BookOpen, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  PlusCircle, 
  ShieldCheck,
  Download
} from 'lucide-react';
import { TrainingCourseDto } from '@/lib/types';
import { formatRwf } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function HospitalityAcademyPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<TrainingCourseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Enrollment modal
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourseDto | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [successCert, setSuccessCert] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/academy');
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnrollStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !staffName || !staffEmail) return;
    setEnrolling(true);

    try {
      const res = await fetch('/api/academy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          participantName: staffName,
          participantEmail: staffEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.enrollment) {
        setSuccessCert(data.enrollment.certificateNumber);
        setStaffName('');
        setStaffEmail('');
        fetchCourses();
      } else {
        alert(data.error || 'Enrollment failed');
      }
    } catch (e) {
      console.error('Enrollment error:', e);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="space-y-10">

      <DashboardHeader
        title={<>Rwandan Hospitality <span className="text-sky-600">Academy</span></>}
        subtitle="Upskill your lodge and restaurant personnel to international 5-star standards. Complete certified masterclasses in Rwandan cultural warmth, fine dining silver service, and eco-conservation protocols."
        actions={
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Impacts QA Audit Score</span>
            </div>
            <p className="text-[11px] text-slate-600 font-normal">Certified staff adds up to +15 points on your official Higa Lux audit.</p>
          </div>
        }
      />

      {/* Courses Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3 font-medium">Loading masterclasses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 transition-all flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                
                {/* Course Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 block mb-1">
                      {course.category} • {course.durationHours} Hours Intensive
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {course.description}
                </p>

                {/* Modules Checklist */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Core Curriculum Modules</div>
                  <div className="space-y-1.5">
                    {course.modules?.map((mod, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tuition / Certification</div>
                  <div className="text-sm font-bold text-slate-900">
                    {course.price > 0 ? formatRwf(course.price) : 'Free for Certified Partners'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{course.enrolledCount} Staff Certified</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(course);
                    setSuccessCert(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/25 hover:opacity-95 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enroll Staff</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Staff Enrollment Modal */}
      <Modal
        open={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title}
        subtitle="Enroll Team Member"
        size="sm"
      >
        <div className="p-6 space-y-5">
          {successCert ? (
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-3">
              <CheckCircle2 className="w-6 h-6 text-sky-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Enrollment & Certificate Generated!</h4>
              <p className="text-xs text-slate-600 font-normal">
                Staff member enrolled successfully. Official Certificate Number:
              </p>
              <div className="p-2 rounded-xl bg-slate-100 font-mono text-sm font-bold text-slate-900 border border-slate-300">
                {successCert}
              </div>
              <Button
                type="button"
                onClick={() => {
                  setSelectedCourse(null);
                  setSuccessCert(null);
                }}
                variant="primary"
                fullWidth
                className="!rounded-xl mt-2 hover:opacity-95"
              >
                Close & Return
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEnrollStaff} className="space-y-4">
              <Input
                label="Staff Member Full Name"
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Eric Habimana (Head Butler)"
                required
              />

              <Input
                label="Staff Work Email"
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="e.g. eric@theretreatrwanda.com"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  variant="ghost"
                  size="sm"
                  className="bg-transparent border-none shadow-none text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={enrolling}
                  variant="primary"
                  size="sm"
                  className="!rounded-xl hover:opacity-95"
                >
                  {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

    </div>
  );
}
