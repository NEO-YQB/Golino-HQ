'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Share2,
  Eye,
  Send,
} from 'lucide-react';
import { TaskItem, TaskStatus } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterDept !== 'all' && t.departmentId !== filterDept) return false;
    return true;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'awaiting_approval':
        return (
          <span className="text-[10px] bg-gold-400/10 text-gold-400 px-2.5 py-1 rounded-full font-bold border border-gold-400/30">
            نیازمند تایید شما
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-500/30">
            در حال انجام
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
            تایید و منتشر شده
          </span>
        );
      case 'pending':
        return (
          <span className="text-[10px] bg-slate-700/30 text-slate-400 px-2.5 py-1 rounded-full font-bold">
            در صف انتظار
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال بارگذاری کارتابل تسک‌ها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-5 h-5 text-gold-400" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              کارتابل و صف اجرای تسک‌های سازمان
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            مشاهده پیش‌نویس محتواهای تولیدشده، تصاویر آماده، و تایید نهایی برای انتشار در کانال‌ها.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterStatus('all')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
            filterStatus === 'all'
              ? 'bg-gold-500 text-black font-bold'
              : 'bg-[#121824] text-slate-300 hover:bg-[#1a2334] border border-[#1f293d]'
          }`}
        >
          همه تسک‌ها ({tasks.length})
        </button>
        <button
          onClick={() => setFilterStatus('awaiting_approval')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
            filterStatus === 'awaiting_approval'
              ? 'bg-gold-500 text-black font-bold'
              : 'bg-[#121824] text-gold-400 hover:bg-[#1a2334] border border-gold-400/30'
          }`}
        >
          منتظر تایید شما ({tasks.filter((t) => t.status === 'awaiting_approval').length})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
            filterStatus === 'in_progress'
              ? 'bg-gold-500 text-black font-bold'
              : 'bg-[#121824] text-slate-300 hover:bg-[#1a2334] border border-[#1f293d]'
          }`}
        >
          در حال انجام ({tasks.filter((t) => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
            filterStatus === 'completed'
              ? 'bg-gold-500 text-black font-bold'
              : 'bg-[#121824] text-slate-300 hover:bg-[#1a2334] border border-[#1f293d]'
          }`}
        >
          تکمیل و منتشر شده ({tasks.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#121824] p-10 rounded-2xl border border-[#1f293d] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">هیچ تسکی در این بخش وجود ندارد</h3>
            <p className="text-xs text-hq-muted max-w-sm mx-auto leading-relaxed">
              تسک‌ها به صورت خودکار زمانی ایجاد می‌شوند که شما در اتاق جلسه با مدیران (مثل سارا راد در سوشال) گفتگو کرده و دستوری ثبت نمایید.
            </p>
            <Link
              href="/meeting/social"
              className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold px-4 py-2 rounded-xl transition-colors mt-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ورود به جلسه با سارا راد و ثبت تسک</span>
            </Link>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                task.status === 'awaiting_approval'
                  ? 'bg-[#161f30] border-gold-400/40 shadow-lg shadow-gold-500/5'
                  : 'bg-[#121824] border-[#1f293d]'
              }`}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-gold-400">
                      {task.departmentNameFa}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300">مسئول: {task.assignedAgentName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">موعد: {task.dueDateFa}</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-white">{task.titleFa}</h3>
                </div>
                <div>{getStatusBadge(task.status)}</div>
              </div>

              {/* Target Channels Badges */}
              {task.targetChannels && task.targetChannels.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">کانال‌های مقصد:</span>
                  {task.targetChannels.map((ch, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              )}

              {/* Media & Content Draft Preview */}
              {(task.contentFa || task.imageUrl) && (
                <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-[#1f293d]/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-gold-400">
                      <Eye className="w-4 h-4" />
                      پیش‌نمایش محتوای آماده انتشار:
                    </span>
                    <span className="text-[11px] text-slate-400">تولید شده توسط تیم</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {task.imageUrl && (
                      <div className="md:col-span-1">
                        <img
                          src={task.imageUrl}
                          alt="بنر محتوا"
                          className="w-full h-32 md:h-full object-cover rounded-lg border border-slate-800"
                        />
                      </div>
                    )}
                    <div className={task.imageUrl ? 'md:col-span-3' : 'md:col-span-4'}>
                      <p className="text-xs md:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {task.contentFa}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 border-t border-[#1f293d] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-hq-muted">شناسه: {task.id}</span>

                <div className="flex items-center gap-2">
                  {task.status === 'awaiting_approval' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تایید و انتشار خودکار در شبکه‌ها</span>
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1"
                    >
                      تکمیل دستی
                    </button>
                  )}
                  <Link
                    href={`/meeting/${task.departmentId}`}
                    className="flex items-center gap-1 bg-[#1a2334] hover:bg-[#25334c] text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-[#1f293d] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>فیدبک و گفتگو با مدیر</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
