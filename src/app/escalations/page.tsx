'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { EscalationMessage } from '@/types';

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/escalations')
      .then((r) => r.json())
      .then((data) => {
        setEscalations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newStatus: 'resolved' }),
      });
      if (res.ok) {
        setEscalations((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold border border-rose-500/20">
            خطای بحرانی
          </span>
        );
      case 'urgent':
        return (
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
            فوری
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium border border-blue-500/20">
            اطلاع‌رسانی عادی
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال بررسی صندوق هشدارهای سازمان...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-gold-400" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              صندوق پیام‌های مستقیم، هشدارها و خطاهای بحرانی
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            پیام‌های اضطراری که توسط اعضای تیم (از مدیر تا کارشناس) مستقیماً برای جلب توجه مدیرعامل ارسال شده است.
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {escalations.length === 0 ? (
          <div className="bg-[#121824] p-8 rounded-xl border border-[#1f293d] text-center text-hq-muted text-sm">
            صندوق پیام‌های اضطراری خالی است و خطایی گزارش نشده است.
          </div>
        ) : (
          escalations.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'unread'
                  ? 'bg-[#161f30] border-rose-500/30'
                  : 'bg-[#121824] border-[#1f293d] opacity-80'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {item.senderAgentName} ({item.senderRoleFa})
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-gold-400">{item.departmentNameFa}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getUrgencyBadge(item.urgency)}
                  {item.status === 'unread' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="جدید"></span>
                  )}
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-200 bg-[#0b0f17] p-3 rounded-lg border border-[#1f293d]/60 mb-3 leading-relaxed">
                {item.messageFa}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#1f293d]">
                <span className="text-[11px] text-hq-muted">
                  وضعیت: {item.status === 'resolved' ? 'بررسی و حل شده' : 'نیازمند بررسی مدیرعامل'}
                </span>

                <div className="flex items-center gap-2">
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>علامت‌گذاری به عنوان حل‌شده</span>
                    </button>
                  )}
                  <Link
                    href={`/meeting/${item.departmentId}`}
                    className="flex items-center gap-1 bg-[#1a2334] hover:bg-[#25334c] text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f293d] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>پاسخ در اتاق جلسه</span>
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
