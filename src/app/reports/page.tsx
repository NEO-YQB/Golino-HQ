'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  Calendar,
} from 'lucide-react';
import { ExecutiveReport } from '@/types';

export default function ReportsPage() {
  const [reports, setReports] = useState<ExecutiveReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال دریافت گزارش‌های عملکرد دوره‌ای...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-gold-400" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              گزارش‌های عملکرد دوره‌ای دپارتمان‌ها (Executive Reports)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            خلاصه مدیریتی، شاخص‌های کلیدی عملکرد (KPIs)، دستاوردها و موانع پیش‌رو به زبان فارسی روان.
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="bg-[#121824] p-10 rounded-2xl border border-[#1f293d] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 mx-auto flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">صندوق گزارش‌ها آماده اولین دوره کاری</h3>
            <p className="text-xs text-hq-muted max-w-sm mx-auto leading-relaxed">
              گزارش‌های رسمی و تحلیلی عملکرد دپارتمان‌ها به‌صورت هفتگی و ماهانه پس از اجرای اولین تسک‌ها در این بخش قرار می‌گیرند.
            </p>
          </div>
        ) : (
          reports.map((report) => (
          <div
            key={report.id}
            className="bg-[#121824] rounded-2xl border border-[#1f293d] overflow-hidden p-5 space-y-4 shadow-xl"
          >
            {/* Title & Metadata */}
            <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[#1f293d] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gold-400">
                    {report.departmentNameFa}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {report.periodFa}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">{report.titleFa}</h2>
              </div>
              <span className="text-[11px] text-hq-muted bg-[#0b0f17] px-2.5 py-1 rounded-lg border border-[#1f293d]">
                تاریخ ثبت: {report.createdAt}
              </span>
            </div>

            {/* Executive Summary */}
            <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-[#1f293d]/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-200 block mb-1">خلاصه مدیریتی:</span>
              {report.summaryFa}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {report.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-[#161f30] p-3 rounded-xl border border-[#25334c] flex flex-col justify-between"
                >
                  <span className="text-[11px] text-slate-400 mb-1">{metric.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-white">{metric.value}</span>
                    {metric.change && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {metric.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Accomplishments & Blockers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Accomplishments */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  دستاوردهای کلیدی محقق شده:
                </h4>
                <div className="space-y-1.5">
                  {report.accomplishments.map((acc, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-emerald-950/20 text-slate-200 p-2 rounded-lg border border-emerald-500/20 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  موانع و نیاز به تصمیم‌گیری:
                </h4>
                <div className="space-y-1.5">
                  {report.blockers.map((blk, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-amber-950/20 text-slate-200 p-2 rounded-lg border border-amber-500/20 flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{blk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
