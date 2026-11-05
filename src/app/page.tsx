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
  Send,
  Trash2,
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('آیا از حذف این تسک اطمینان داری افشین جان؟')) return;
    try {
      const res = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
            <span className="text-xs text-slate-400">کنسول فرماندهی ۲۴/۷</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mb-1">
            درود افشین عزیز؛ تیم‌های اجرایی آماده هم‌فکری و دستورات تو هستند
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            مدیران دپارتمان‌های سوشال مدیا، سئو و عملیات گلینو مستقر شده‌اند. می‌توانی در اتاق جلسات با آن‌ها آزادانه گفتگو کنی، تحلیل و نظراتشان را بشنوی و استراتژی‌های جدید را با هم پیش ببرید.
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
            <span className="text-[10px] text-gold-400/80">تسک در انتظار</span>
          </div>
        </div>

        <div className="bg-[#121824] p-4 rounded-xl border border-[#1f293d] flex flex-col justify-between">
          <div className="flex items-center justify-between text-hq-muted text-xs mb-2">
            <span>پیام‌های مستقیم</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{unreadAlerts.length}</span>
            <span className="text-[10px] text-slate-400">هشدار جدید</span>
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
              چند مدیر دپارتمان را فرا بخوانید تا با هم بحث کنند و برنامه مشترک را پیاده‌سازی کنند.
            </p>
          </div>
        </div>
        <Link
          href="/boardroom"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors mr-auto"
        >
          <span>برگزاری جلسه هیئت‌مدیره</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              محتواهای آماده تایید نهایی مدیرعامل
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
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded font-semibold border border-gold-400/20">
                      {task.departmentNameFa}
                    </span>
                    <span className="text-xs text-slate-400">مسئول: {task.assignedAgentName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{task.titleFa}</h4>
                  {task.contentFa && (
                    <p className="text-xs text-slate-300 line-clamp-2">{task.contentFa}</p>
                  )}
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
                    <span>فیدبک</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
                    title="حذف و رد این تسک"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
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
            مشاهده تمام اعضای تیم
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] hover:border-gold-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dept.leadAgent.avatar}</span>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-white">{dept.nameFa}</h3>
                      <p className="text-xs text-gold-400 font-medium">
                        مدیر: {dept.leadAgent.name} ({dept.leadAgent.roleFa})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    آماده جلسه
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {dept.descriptionFa}
                </p>

                <div className="flex items-center gap-2 text-xs text-hq-muted mb-4 flex-wrap">
                  <span>تعداد اعضای تیم: <strong className="text-white">{dept.members.length + 1} ایجنت</strong></span>
                  <span>•</span>
                  <span>تسک‌های فعال: <strong className="text-white">{dept.activeTasksCount}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f293d] flex items-center justify-between">
                <Link
                  href={`/meeting/${dept.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 text-xs font-bold py-2.5 rounded-xl border border-gold-400/30 transition-colors shadow-lg shadow-gold-500/5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>ورود به اتاق جلسه کاری با {dept.leadAgent.name}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
