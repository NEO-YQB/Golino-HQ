'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  MessageSquare,
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
            تکمیل شده
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
        <p className="text-sm text-hq-muted">در حال بارگذاری صف تسک‌ها...</p>
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
            کنترل لحظه‌ای فعالیت‌ها، اولویت‌بندی، و تایید نهایی خروجی‌های آماده انتشار.
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
          تکمیل شده ({tasks.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#121824] p-8 rounded-xl border border-[#1f293d] text-center text-hq-muted text-sm">
            تسکی با این فیلتر یافت نشد.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                task.status === 'awaiting_approval'
                  ? 'bg-[#161f30] border-gold-400/40'
                  : 'bg-[#121824] border-[#1f293d]'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gold-400">
                      {task.departmentNameFa}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">مسئول: {task.assignedAgentName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">موعد: {task.dueDateFa}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{task.titleFa}</h3>
                </div>
                <div>{getStatusBadge(task.status)}</div>
              </div>

              {task.notesFa && (
                <p className="text-xs text-slate-300 bg-[#0b0f17] p-2.5 rounded-lg border border-[#1f293d]/60 mb-3 leading-relaxed">
                  {task.notesFa}
                </p>
              )}

              <div className="pt-2 border-t border-[#1f293d] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-hq-muted">شناسه تسک: {task.id}</span>

                <div className="flex items-center gap-2">
                  {task.status === 'awaiting_approval' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تایید و انتشار نهایی</span>
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1"
                    >
                      علامت‌گذاری به عنوان تکمیل شده
                    </button>
                  )}
                  <Link
                    href={`/meeting/${task.departmentId}`}
                    className="flex items-center gap-1 bg-[#1a2334] hover:bg-[#25334c] text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f293d] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>فیدبک در جلسه</span>
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
