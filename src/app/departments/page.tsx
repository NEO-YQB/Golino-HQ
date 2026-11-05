'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Department } from '@/types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال بارگذاری ساختار سازمانی...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-gold-400" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              دپارتمان‌ها و اعضای تیم‌های تخصصی گلینو
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            بررسی سلسله‌مراتب سازمانی، ایجنت‌های هر دپارتمان و ورود به جلسات اختصاصی.
          </p>
        </div>
      </div>

      {/* Departments List */}
      <div className="space-y-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-[#121824] rounded-2xl border border-[#1f293d] overflow-hidden"
          >
            {/* Department Head Card */}
            <div className="p-5 border-b border-[#1f293d] bg-gradient-to-r from-[#161f30] to-[#121824] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-2xl shadow-lg">
                  {dept.leadAgent.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{dept.nameFa}</h2>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      {dept.status === 'active' ? 'دپارتمان فعال' : 'آماده‌باش'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مدیر دپارتمان: <strong className="text-gold-400">{dept.leadAgent.name}</strong> •{' '}
                    {dept.leadAgent.specialtyFa}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/meeting/${dept.id}`}
                  className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-gold-500/10"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>ورود به اتاق جلسه با مدیر</span>
                </Link>
              </div>
            </div>

            {/* Department Members Grid */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-300">
                  اعضای فعال زیرمجموعه ({dept.members.length} ایجنت):
                </span>
                <span>تسک‌های جاری این دپارتمان: {dept.activeTasksCount}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {dept.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-[#0b0f17] p-3.5 rounded-xl border border-[#1f293d]/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{member.avatar}</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{member.name}</h4>
                            <p className="text-[10px] text-gold-400/90">{member.roleFa}</p>
                          </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="فعال"></span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {member.specialtyFa}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-hq-muted">
                      <span>مدل: {member.model}</span>
                      <span className="text-emerald-400 font-medium">آماده دریافت تسک</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
