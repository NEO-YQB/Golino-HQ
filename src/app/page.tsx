'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Department, TaskItem, EscalationMessage } from '@/types';

export default function DashboardPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [escalations, setEscalations] = useState<EscalationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/departments').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/escalations').then((r) => r.json()),
    ])
      .then(([deptData, taskData, escData]) => {
        setDepartments(deptData);
        setTasks(taskData);
        setEscalations(escData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pendingApprovals = tasks.filter((t) => t.status === 'awaiting_approval');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const unreadAlerts = escalations.filter((e) => e.status === 'unread');

  const handleApproveTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newStatus: 'completed' }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال همگام‌سازی اطلاعات دپارتمان‌ها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl luxury-card p-5 border border-gold-400/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gold-400 text-xs font-bold tracking-wider">GOLINO EXECUTIVE HQ</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">اتاق فرماندهی ۲۴/۷</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mb-1">
            درود جناب مدیرعامل؛ سازمان در وضعیت پایدار است
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            ایجنت‌های دپارتمان‌های سئو، شبکه‌های اجتماعی و عملیات گلینو طبق برنامه در سرور فعال هستند. در بخش زیر می‌توانید با هر مدیر جلسه بگذارید، فیدبک بدهید یا مصوبات جدید را ابلاغ کنید.
          </p>
        </div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-2">
            <span>دپارتمان‌ها</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{departments.length}</span>
            <span className="text-[10px] text-emerald-400">تیم تخصصی</span>
          </div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-2">
            <span>تسک‌های در حال اجرا</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{inProgressTasks.length}</span>
            <span className="text-[10px] text-slate-400">در پایپ‌لاین</span>
          </div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-2">
            <span>نیازمند تایید شما</span>
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gold-400">{pendingApprovals.length}</span>
            <span className="text-[10px] text-gold-400/80">تسک منتظر تایید</span>
          </div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-2">
            <span>پیام‌ها و هشدارها</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{unreadAlerts.length}</span>
            <span className="text-[10px] text-rose-400">خوانده‌نشده</span>
          </div>
        </div>
      </div>

      {/* Boardroom Quick Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-[#121824] p-4 rounded-xl border border-blue-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">اتاق جلسات هیئت‌مدیره (Cross-Department)</h3>
            <p className="text-xs text-slate-400">
              چند مدیر را انتخاب کنید، موضوع یا کمپین جدید را بگویید و بگذارید هوش مصنوعی‌ها با هم هماهنگ شوند.
            </p>
          </div>
        </div>
        <Link
          href="/boardroom"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors mr-auto"
        >
          <span>برگزاری جلسه گروهی</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              تسک‌های نیازمند تایید فوری مدیرعامل
            </h2>
            <Link href="/tasks" className="text-xs text-gold-400 hover:underline">
              مشاهده همه
            </Link>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((task) => (
              <div
                key={task.id}
                className="bg-[#121824] p-4 rounded-xl border border-gold-400/30 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded font-semibold border border-gold-400/20">
                      {task.departmentNameFa}
                    </span>
                    <span className="text-xs text-slate-400">مسئول: {task.assignedAgentName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{task.titleFa}</h4>
                  {task.notesFa && <p className="text-xs text-slate-400">{task.notesFa}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveTask(task.id)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تایید و انتشار</span>
                  </button>
                  <Link
                    href={`/meeting/${task.departmentId}`}
                    className="flex items-center gap-1 bg-[#1a2334] hover:bg-[#25334c] text-slate-300 text-xs px-3 py-1.5 rounded-lg transition-colors border border-[#1f293d]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>فیدبک به مدیر</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-400" />
            دپارتمان‌ها و اتاق جلسات ۱ به ۱ با مدیران
          </h2>
          <Link href="/departments" className="text-xs text-hq-muted hover:text-white">
            مشاهده اعضای کامل
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-[#121824] p-4 rounded-xl border border-[#1f293d] hover:border-gold-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dept.leadAgent.avatar}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{dept.nameFa}</h3>
                      <p className="text-[11px] text-slate-400">
                        مدیر: {dept.leadAgent.name} ({dept.leadAgent.roleFa})
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      dept.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-700/30 text-slate-400'
                    }`}
                  >
                    {dept.status === 'active' ? 'در حال فعالیت' : 'آماده‌باش'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {dept.descriptionFa}
                </p>

                <div className="flex items-center gap-3 text-xs text-hq-muted mb-4">
                  <span>تعداد اعضا: {dept.members.length + 1} ایجنت</span>
                  <span>•</span>
                  <span>تسک‌های فعال: {dept.activeTasksCount}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f293d] flex items-center justify-between">
                <Link
                  href={`/meeting/${dept.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 text-xs font-bold py-2 rounded-lg border border-gold-400/30 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ورود به اتاق جلسه با {dept.leadAgent.name}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
