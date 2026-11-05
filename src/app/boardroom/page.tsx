'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  ArrowRight,
  CheckSquare,
  MessageSquare,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Department, BoardroomSession } from '@/types';

export default function BoardroomPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<BoardroomSession[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(['seo', 'social']);
  const [topic, setTopic] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/departments').then((r) => r.json()),
      fetch('/api/boardroom').then((r) => r.json()),
    ])
      .then(([depts, sess]) => {
        setDepartments(depts);
        setSessions(sess);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleDept = (id: string) => {
    if (selectedDeptIds.includes(id)) {
      if (selectedDeptIds.length > 1) {
        setSelectedDeptIds(selectedDeptIds.filter((d) => d !== id));
      }
    } else {
      setSelectedDeptIds([...selectedDeptIds, id]);
    }
  };

  const handleStartBoardroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || selectedDeptIds.length < 2 || isSimulating) return;

    setIsSimulating(true);
    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicFa: topic.trim(),
          departmentIds: selectedDeptIds,
        }),
      });

      if (res.ok) {
        const newSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setTopic('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال آماده‌سازی سالن جلسات هیئت‌مدیره...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-gold-400" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              اتاق جلسات گروهی هیئت‌مدیره (Cross-Department Boardroom)
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            ایده، چالش یا کمپین جدید را مطرح کنید و چند مدیر دپارتمان را فرا بخوانید تا با هم بحث کنند، به توافق برسند و وظایف را بین تیم‌هایشان تقسیم کنند.
          </p>
        </div>
      </div>

      {/* Meeting Setup Card */}
      <form
        onSubmit={handleStartBoardroom}
        className="luxury-card p-5 rounded-2xl border border-gold-400/20 space-y-4"
      >
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            ۱. انتخاب مدیران حاضر در جلسه (حداقل ۲ مدیر):
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {departments.map((dept) => {
              const isSelected = selectedDeptIds.includes(dept.id);
              return (
                <button
                  type="button"
                  key={dept.id}
                  onClick={() => toggleDept(dept.id)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-gold-400/10 border-gold-400 text-white'
                      : 'bg-[#121824] border-[#1f293d] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{dept.leadAgent.avatar}</span>
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">{dept.leadAgent.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{dept.nameFa}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            ۲. موضوع جلسه / دستور جلسه مدیرعامل:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: راه‌اندازی کمپین فروش ویژه روز مادر با تمرکز بر سبد گل لوکس و ارسال ۱ ساعته"
            className="w-full bg-[#0b0f17] text-sm text-white px-4 py-3 rounded-xl border border-[#25334c] focus:outline-none focus:border-gold-400 placeholder:text-slate-500 transition-colors"
            disabled={isSimulating}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>پس از جلسه، وظایف توافق‌شده خودکار به کارتابل تسک‌ها اضافه می‌شوند.</span>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || selectedDeptIds.length < 2 || isSimulating}
            className="bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>مدیران در حال گفتگو و تقسیم وظایف...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>شروع جلسه هیئت‌مدیره</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Previous Sessions */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>صورت‌جلسات و مصوبات قبلی هیئت‌مدیره</span>
          <span className="text-xs text-slate-400 font-normal">({sessions.length} جلسه)</span>
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-[#121824] p-8 rounded-xl border border-[#1f293d] text-center text-hq-muted text-sm">
            هنوز جلسه گروهی برگزار نشده است. از فرم بالا اولین جلسه را آغاز کنید!
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className="bg-[#121824] p-5 rounded-2xl border border-[#1f293d] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#1f293d] pb-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-gold-400 font-medium">موضوع جلسه:</span>
                  <h3 className="text-base font-bold text-white">{sess.topicFa}</h3>
                </div>
                <span className="text-xs text-slate-400">{sess.createdAt}</span>
              </div>

              {/* Dialogue Transcript */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-300">مذاکرات مدیران حاضر:</p>
                <div className="space-y-2">
                  {sess.messages.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#0b0f17] p-3 rounded-xl border border-[#1f293d]/80 text-xs leading-relaxed space-y-1"
                    >
                      <div className="flex items-center gap-2 text-gold-400 font-bold text-[11px]">
                        <span>{m.senderName}</span>
                        <span className="text-slate-500 font-normal">•</span>
                        <span className="text-slate-400 font-normal">{m.senderRoleFa}</span>
                      </div>
                      <p className="text-slate-200">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items Created */}
              {sess.actionItems && sess.actionItems.length > 0 && (
                <div className="pt-2 border-t border-[#1f293d] space-y-2">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    مصوبات قطعی و تسک‌های ایجاد شده برای دپارتمان‌ها:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sess.actionItems.map((act) => (
                      <div
                        key={act.id}
                        className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-200 font-medium">{act.taskFa}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 mr-2">
                          {act.assignedDeptNameFa}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
