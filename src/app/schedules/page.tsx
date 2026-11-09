'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { DepartmentSchedule, ScheduleStep } from '@/types';
import { getTodayPersianDate } from '@/lib/persianDate';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<DepartmentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  // New Schedule Form State
  const [formDeptId, setFormDeptId] = useState('seo');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStartDate, setFormStartDate] = useState(getTodayPersianDate());
  const [formTargetDate, setFormTargetDate] = useState('۱۴۰۵/۰۸/۳۰');
  const [formSteps, setFormSteps] = useState<
    { titleFa: string; assignedTo: string; targetDateFa: string; descriptionFa: string }[]
  >([
    { titleFa: 'مرحله ۱: بررسی اولیه و تدوین الزامات', assignedTo: 'مدیر دپارتمان', targetDateFa: getTodayPersianDate(), descriptionFa: '' },
    { titleFa: 'مرحله ۲: پیاده‌سازی و اجرای میدانی', assignedTo: 'تیم تخصصی', targetDateFa: '۱۴۰۵/۰۸/۲۵', descriptionFa: '' },
  ]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleToggleStep = async (scheduleId: string, stepId: string) => {
    try {
      setUpdatingStepId(stepId);
      const res = await fetch(`/api/schedules/${scheduleId}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      });

      if (res.ok) {
        const updatedSchedule: DepartmentSchedule = await res.json();
        setSchedules((prev) =>
          prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
        );
      }
    } catch (err) {
      console.error('Error toggling step:', err);
    } finally {
      setUpdatingStepId(null);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('افشین جان، آیا از حذف این برنامه زمان‌بندی اطمینان داری؟')) return;
    try {
      const res = await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const handleAddStepToForm = () => {
    setFormSteps((prev) => [
      ...prev,
      {
        titleFa: `مرحله ${prev.length + 1}: `,
        assignedTo: 'مسئول اجرایی',
        targetDateFa: formTargetDate,
        descriptionFa: '',
      },
    ]);
  };

  const handleRemoveStepFromForm = (index: number) => {
    setFormSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const deptMap: Record<string, { nameFa: string; manager: string; avatar: string }> = {
      seo: { nameFa: 'دپارتمان سئو و محتوا', manager: 'آرشام سهرابی (مدیر سئو)', avatar: '🔍' },
      social: { nameFa: 'دپارتمان شبکه‌های اجتماعی و برند', manager: 'سارا راد (مدیر سوشال)', avatar: '👩‍💼' },
      vendors: { nameFa: 'امور فروشندگان و تامین‌کنندگان', manager: 'سامان پارسا (مدیر تامین)', avatar: '🤝' },
      support: { nameFa: 'پشتیبانی مشتریان و CRM', manager: 'هومان مهر (مدیر پشتیبانی)', avatar: '🎧' },
    };

    const deptInfo = deptMap[formDeptId] || {
      nameFa: 'دپارتمان اجرایی',
      manager: 'مدیر دپارتمان',
      avatar: '📋',
    };

    const stepsPayload: ScheduleStep[] = formSteps.map((s, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      stepNumber: idx + 1,
      titleFa: s.titleFa,
      descriptionFa: s.descriptionFa || undefined,
      assignedTo: s.assignedTo || deptInfo.manager,
      status: 'pending',
      targetDateFa: s.targetDateFa || formTargetDate,
    }));

    const newSchedule: Partial<DepartmentSchedule> = {
      departmentId: formDeptId,
      departmentNameFa: deptInfo.nameFa,
      creatorAgentName: deptInfo.manager,
      creatorAvatar: deptInfo.avatar,
      titleFa: formTitle,
      descriptionFa: formDesc,
      startDateFa: formStartDate,
      targetDateFa: formTargetDate,
      status: 'in_progress',
      progressPercent: 0,
      steps: stepsPayload,
      createdAtFa: getTodayPersianDate(),
    };

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });

      if (res.ok) {
        const created = await res.json();
        setSchedules((prev) => [created, ...prev]);
        setShowCreateModal(false);
        setFormTitle('');
        setFormDesc('');
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
    }
  };

  // Stats calculation
  const totalSchedules = schedules.length;
  const inProgressSchedules = schedules.filter((s) => s.status === 'in_progress').length;
  const completedSchedules = schedules.filter((s) => s.status === 'completed').length;
  const totalSteps = schedules.reduce((acc, s) => acc + (s.steps?.length || 0), 0);
  const completedSteps = schedules.reduce(
    (acc, s) => acc + (s.steps?.filter((st) => st.status === 'completed').length || 0),
    0
  );
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    if (selectedDept !== 'all' && s.departmentId !== selectedDept) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121824] p-5 rounded-2xl border border-[#1f293d]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold-400/10 rounded-xl border border-gold-400/20 text-gold-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">برنامه‌ها و زمان‌بندی دپارتمان‌ها</h1>
              <p className="text-xs text-hq-muted">
                پایش گام‌به‌گام برنامه‌های چند مرحله‌ای، تفکیک موارد انجام‌شده و موعد مراحل پیش‌رو (تاریخ شمسی)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs shadow-lg shadow-gold-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            تعریف زمان‌بندی جدید
          </button>
          <button
            onClick={loadSchedules}
            className="p-2 rounded-xl bg-[#1a2334] hover:bg-[#222e44] text-slate-300 border border-[#1f293d] transition-colors"
            title="بروزرسانی اطلاعات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d]">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-1">
            <span>کل برنامه‌ها</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{totalSchedules}</div>
          <div className="text-[11px] text-slate-400 mt-1">طرح اجرایی ثبت‌شده</div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d]">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-1">
            <span>در حال اجرا</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{inProgressSchedules}</div>
          <div className="text-[11px] text-slate-400 mt-1">فعال در دپارتمان‌ها</div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d]">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-1">
            <span>تکمیل‌شده</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{completedSchedules}</div>
          <div className="text-[11px] text-slate-400 mt-1">با موفقیت خاتمه‌یافته</div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d]">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-1">
            <span>پیشرفت کل مراحل</span>
            <TrendingUp className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-xl font-bold text-gold-400">{overallProgress}٪</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedSteps} از {totalSteps} گام نهایی شده
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121824] p-3 rounded-xl border border-[#1f293d]">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-hq-muted ml-2">دپارتمان:</span>
          {[
            { id: 'all', label: 'همه' },
            { id: 'seo', label: 'سئو (آرشام)' },
            { id: 'social', label: 'سوشال (سارا)' },
            { id: 'vendors', label: 'تامین‌کنندگان (سامان)' },
            { id: 'support', label: 'پشتیبانی (هومان)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDept(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDept === tab.id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#1a2334]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-hq-muted ml-1">وضعیت:</span>
          {[
            { id: 'all', label: 'همه' },
            { id: 'in_progress', label: 'در حال اجرا' },
            { id: 'completed', label: 'تکمیل‌شده' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                selectedStatus === tab.id
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-hq-muted hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#121824] rounded-2xl border border-[#1f293d]">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          بارگذاری زمان‌بندی‌های اجرایی...
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#121824] rounded-2xl border border-[#1f293d] space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm">هیچ برنامه زمان‌بندی با این مشخصات یافت نشد.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs text-gold-400 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            تعریف اولین برنامه زمان‌بندی
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredSchedules.map((schedule) => {
            const completedCount = schedule.steps.filter((s) => s.status === 'completed').length;
            const pendingCount = schedule.steps.filter((s) => s.status !== 'completed').length;
            const completedItems = schedule.steps.filter((s) => s.status === 'completed');
            const pendingItems = schedule.steps.filter((s) => s.status !== 'completed');

            return (
              <div
                key={schedule.id}
                className="bg-[#121824] rounded-2xl border border-[#1f293d] overflow-hidden shadow-lg hover:border-[#2b3952] transition-colors"
              >
                {/* Schedule Card Header */}
                <div className="p-5 border-b border-[#1f293d]/80 bg-[#0e141f]/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{schedule.creatorAvatar || '📋'}</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {schedule.creatorAgentName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {schedule.departmentNameFa}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            schedule.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {schedule.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white pt-1">{schedule.titleFa}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Date Badge */}
                      <div className="flex items-center gap-1.5 bg-[#172131] px-3 py-1.5 rounded-xl border border-[#222e44] text-[11px] text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-gold-400" />
                        <span>بازه شمسی:</span>
                        <span className="font-mono text-white">{schedule.startDateFa}</span>
                        <span>تا</span>
                        <span className="font-mono text-white">{schedule.targetDateFa}</span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="حذف برنامه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {schedule.descriptionFa && (
                    <p className="text-xs text-hq-muted mt-2.5 leading-relaxed">
                      {schedule.descriptionFa}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-[#1f293d]/50">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-medium">پیشرفت کلی برنامه:</span>
                        <span className="font-bold text-gold-400 text-sm">
                          {schedule.progressPercent}٪
                        </span>
                      </div>
                      <div className="text-[11px] text-hq-muted">
                        <span className="text-emerald-400 font-semibold">{completedCount}</span> گام
                        تکمیل‌شده •{' '}
                        <span className="text-amber-400 font-semibold">{pendingCount}</span> گام در
                        پیش‌رو
                      </div>
                    </div>

                    <div className="w-full bg-[#1b2537] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          schedule.progressPercent === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-gold-500 via-amber-400 to-gold-300'
                        }`}
                        style={{ width: `${schedule.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Multi-Step Breakdown: Completed vs Upcoming */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Column 1: مراحل انجام‌شده (Completed Steps) */}
                  <div className="bg-[#0b101a]/70 p-4 rounded-xl border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>مراحل انجام‌شده ({completedItems.length})</span>
                      </div>
                      <span className="text-[10px] text-hq-muted">همراه با تاریخ ثبت</span>
                    </div>

                    {completedItems.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">
                        هنوز مرحله‌ای از این برنامه تکمیل نشده است.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {completedItems.map((step) => (
                          <div
                            key={step.id}
                            className="bg-[#121927] p-3 rounded-lg border border-emerald-500/25 space-y-1.5 text-xs hover:border-emerald-500/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <div>
                                  <h4 className="font-semibold text-slate-200 line-through decoration-slate-500">
                                    {step.titleFa}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    مسئول: {step.assignedTo}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleStep(schedule.id, step.id)}
                                disabled={updatingStepId === step.id}
                                className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors shrink-0 px-2 py-0.5 rounded bg-[#1a2334]"
                                title="تغییر به در حال انجام"
                              >
                                {updatingStepId === step.id ? '...' : 'بازگردانی'}
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-[#1f293d]/60 text-[11px]">
                              <span className="text-emerald-400 font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                تاریخ انجام: {step.completedDateFa || 'ثبت‌شده'}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                موعد مقرر: {step.targetDateFa}
                              </span>
                            </div>

                            {step.notesFa && (
                              <p className="text-[10px] text-slate-400 bg-[#0e141f] p-1.5 rounded border border-[#1f293d]">
                                💡 نتیجه: {step.notesFa}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column 2: مراحلی که باید انجام شوند (Pending / Upcoming Steps) */}
                  <div className="bg-[#0b101a]/70 p-4 rounded-xl border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                        <Clock className="w-4 h-4" />
                        <span>مراحلی که باید انجام شوند ({pendingItems.length})</span>
                      </div>
                      <span className="text-[10px] text-hq-muted">موعدهای پیش‌رو</span>
                    </div>

                    {pendingItems.length === 0 ? (
                      <div className="text-center py-6 text-xs text-emerald-400 font-semibold">
                        🎉 تمامی مراحل این برنامه با موفقیت به پایان رسیده‌اند!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {pendingItems.map((step, idx) => {
                          const isNextStep = idx === 0;

                          return (
                            <div
                              key={step.id}
                              className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                                isNextStep
                                  ? 'bg-[#151d2c] border-amber-500/40 shadow-md shadow-amber-500/5'
                                  : 'bg-[#121927] border-[#1f293d] opacity-90'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2">
                                  <span
                                    className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                                      isNextStep
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {step.stepNumber}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-white">{step.titleFa}</h4>
                                      {isNextStep && (
                                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                          گام جاری
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      مسئول: {step.assignedTo}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleToggleStep(schedule.id, step.id)}
                                  disabled={updatingStepId === step.id}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-black hover:bg-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all shrink-0"
                                  title="تایید انجام این مرحله"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {updatingStepId === step.id ? '...' : 'تکمیل شد'}
                                </button>
                              </div>

                              {step.descriptionFa && (
                                <p className="text-[11px] text-hq-muted leading-relaxed">
                                  {step.descriptionFa}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-[#1f293d]/60 text-[11px]">
                                <span className="text-amber-400 font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-amber-400" />
                                  تاریخ موعد انجام: {step.targetDateFa}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  وضعیت: در انتظار اجرا
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Quick Action */}
                <div className="px-5 py-2.5 bg-[#0e141f] border-t border-[#1f293d] flex items-center justify-between text-xs text-hq-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>آخرین بروزرسانی: {schedule.updatedAtFa || schedule.createdAtFa}</span>
                  </div>
                  <Link
                    href={`/meeting/${schedule.departmentId}`}
                    className="text-gold-400 hover:text-gold-300 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    گفتگو با مدیر دپارتمان درباره این برنامه
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create New Schedule */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121824] border border-[#1f293d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gold-400/10 text-gold-400 border border-gold-400/20">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">تعریف برنامه زمان‌بندی جدید</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    دپارتمان مجری:
                  </label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400"
                  >
                    <option value="seo">دپارتمان سئو و محتوا (آرشام سهرابی)</option>
                    <option value="social">دپارتمان شبکه‌های اجتماعی (سارا راد)</option>
                    <option value="vendors">امور تامین‌کنندگان و گل‌فروشان (سامان پارسا)</option>
                    <option value="support">پشتیبانی و ارتباط با مشتریان (هومان مهر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    عنوان کلی برنامه:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: طرح ارتقای رتبه ۱ کلمات کلیدی باکس گل"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  توضیحات و اهداف استراتژیک برنامه:
                </label>
                <textarea
                  rows={2}
                  placeholder="اهداف این برنامه، خروجی مورد انتظار و جزئیات تکمیلی..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#0b0f17] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    تاریخ شروع (شمسی):
                  </label>
                  <input
                    type="text"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    تاریخ هدف پایان (شمسی):
                  </label>
                  <input
                    type="text"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Steps Definition Section */}
              <div className="pt-2 border-t border-[#1f293d] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-gold-400" />
                    مراحل اجرایی برنامه ({formSteps.length} گام):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStepToForm}
                    className="text-[11px] text-gold-400 hover:text-gold-300 flex items-center gap-1 bg-gold-400/10 px-2 py-1 rounded-lg border border-gold-400/20"
                  >
                    <Plus className="w-3 h-3" />
                    افزودن گام جدید
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {formSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0b0f17] p-3 rounded-xl border border-[#1f293d] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gold-400 text-[11px]">گام {idx + 1}</span>
                        {formSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStepFromForm(idx)}
                            className="text-rose-400 hover:text-rose-300 text-[10px]"
                          >
                            حذف این گام
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="عنوان مرحله اجرایی"
                        value={step.titleFa}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormSteps((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, titleFa: val } : s))
                          );
                        }}
                        className="w-full bg-[#121824] border border-[#1f293d] rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="مسئول اجرا (مثلاً آرشام سهرابی)"
                          value={step.assignedTo}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormSteps((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, assignedTo: val } : s))
                            );
                          }}
                          className="bg-[#121824] border border-[#1f293d] rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="موعد شمسی (مثلاً ۱۴۰۵/۰۸/۲۲)"
                          value={step.targetDateFa}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormSteps((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, targetDateFa: val } : s))
                            );
                          }}
                          className="bg-[#121824] border border-[#1f293d] rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f293d]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-[#1a2334]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-lg shadow-gold-500/10"
                >
                  ثبت و راه‌اندازی برنامه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
