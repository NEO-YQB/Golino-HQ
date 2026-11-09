'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckSquare,
  RotateCcw,
} from 'lucide-react';
import { Department, ChatMessage } from '@/types';

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const deptId = (params?.deptId as string) || 'social';

  const [department, setDepartment] = useState<Department | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch departments
    fetch('/api/departments')
      .then((r) => r.json())
      .then((depts: Department[]) => {
        const found = depts.find((d) => d.id === deptId);
        if (found) {
          setDepartment(found);
        }
      });

    // 2. Fetch Chat History
    fetch(`/api/meeting?deptId=${deptId}`)
      .then((r) => r.json())
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [deptId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistically add CEO message
    const tempCeoMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      departmentId: deptId,
      sender: 'ceo',
      senderName: 'مدیرعامل',
      text: textToSend,
      timestamp: 'همین الان',
    };
    setMessages((prev) => [...prev, tempCeoMsg]);

    try {
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deptId, text: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempCeoMsg.id),
          data.ceoMessage,
          data.leadMessage,
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const handleClearChat = async () => {
    if (!confirm('آیا از پاک کردن کامل تاریخچه این گفتگو اطمینان داری افشین جان؟')) return;
    try {
      const res = await fetch(`/api/meeting?deptId=${deptId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !department) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-hq-muted">در حال برقراری اتصال امن با اتاق جلسه مدیر...</p>
      </div>
    );
  }

  const lead = department.leadAgent;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[820px] bg-[#121824] rounded-2xl border border-[#1f293d] overflow-hidden shadow-2xl">
      {/* Meeting Header */}
      <div className="bg-[#0e1420] p-4 border-b border-[#1f293d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-[#1a2334] text-slate-300 hover:text-white transition-colors"
            title="بازگشت به داشبورد"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="relative">
            <span className="text-2xl">{lead.avatar}</span>
            <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0e1420]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white">{lead.name}</h2>
              <span className="text-[10px] bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded-full border border-gold-400/20 font-medium">
                {lead.roleFa}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              دپارتمان {department.nameFa} • هوش مصنوعی: {lead.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-rose-400 bg-[#161f30] hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-[#25334c] transition-colors"
            title="پاک‌کردن کامل پیام‌های این چت و شروع مجدد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>شروع مجدد گفتگو</span>
          </button>
          <span className="hidden sm:flex text-xs text-emerald-400 font-medium items-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            اتصال امن
          </span>
        </div>
      </div>

      {/* Specialty Banner */}
      <div className="bg-[#161f30] px-4 py-2 border-b border-[#1f293d] text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
          <span className="truncate">شرح وظیفه: {lead.specialtyFa}</span>
        </div>
        <div className="text-[11px] text-gold-400 font-medium shrink-0 mr-2">
          تیم تحت امر: {department.members.length} ایجنت
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-hq-muted text-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 mx-auto flex items-center justify-center text-xl">
              {lead.avatar}
            </div>
            <h3 className="text-base font-bold text-white">اتاق گفتگوی مستقیم با {lead.name}</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              اینجا فضای هم‌فکری و گفتگوی آزاد با {lead.name} است. درباره وضعیت، ایده‌ها و تصمیمات آزادانه گفتگو کنید.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCeo = msg.sender === 'ceo';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCeo ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {!isCeo && msg.actionsTaken && msg.actionsTaken.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5 max-w-[90%] md:max-w-[78%]">
                    {msg.actionsTaken.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[10px] bg-gold-400/10 text-gold-400 border border-gold-400/25 px-2.5 py-1 rounded-lg font-medium shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`max-w-[90%] md:max-w-[78%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                    isCeo
                      ? 'bg-gradient-to-tr from-gold-600 via-gold-500 to-gold-400 text-black font-semibold shadow-lg shadow-gold-500/10 rounded-tr-none'
                      : 'bg-[#1a2334] text-slate-100 border border-[#25334c] shadow-lg rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {sending && (
          <div className="flex flex-col items-end">
            <div className="bg-[#1a2334] border border-[#25334c] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-bounce delay-200"></div>
              <span className="text-xs text-slate-300 mr-2">
                {lead.name} در حال نوشتن پاسخ...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 bg-[#0e1420]/70 border-t border-[#1f293d] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-400 shrink-0 ml-1">پیشنهاد موضوع گفتگو:</span>
        {deptId === 'seo' ? (
          <>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'آرشام، وضعیت مقالات منتشر شده و رتبه‌بندی‌های سرچ در چه وضعیتیه؟ گام بعدیمون چی باشه؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              🔍 تحلیل رتبه‌بندی و گام بعدی سئو
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'برای کلاستر سالگرد ازدواج چه ایده‌ای داری؟ چطور می‌تونیم ترافیک مستقیم خریدار جذب کنیم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              💍 استراتژی کلاستر سالگرد ازدواج
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'روی لندینگ‌های ارسال فوری گل و خرید در تهران چطور باید با رقبای بزرگ رقابت کنیم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              🚀 استراتژی لندینگ‌های ارسال فوری
            </button>
          </>
        ) : deptId === 'support' ? (
          <>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'هومان، وضعیت پاسخگویی و رضایت خریداران چطوره؟ تیکت باز یا تاخیر در تحویل داریم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              🎧 بررسی وضعیت پشتیبانی و رضایت مشتری
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'بیشترین سوال یا دغدغه مشتری‌ها موقع سفارش گل چی بوده؟ چطور حلش کنیم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              💡 رفع دغدغه‌های پرتکرار خریداران
            </button>
          </>
        ) : deptId === 'vendors' ? (
          <>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'سامان، وضعیت گل‌فروشی‌های عضو و کیفیت گل‌های تحویلی چطوره؟ تخلف یا مغایرتی نداشتیم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              🌸 ارزیابی کیفیت گل‌های تامین‌کنندگان
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'برای جذب و اضافه کردن گل‌فروشی‌های درجه‌یک در مناطق جدید تهران چه برنامه‌ای داری؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              🤝 توسعه شبکه گل‌فروشان جدید
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'سارا نظرت در مورد کمپین آخر هفته چیه؟ به نظرت روی چه دسته‌گل‌هایی تمرکز کنیم تا ورودی بهتری بگیریم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              💡 هم‌فکری برای استراتژی کمپین آخر هفته
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'امیر و پریا چطور با مشتری‌ها توی دایرکت و تلگرام تعامل می‌کنند؟ نرخ تبدیل استعلام‌ها به سفارش چطوره؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              💬 تحلیل وضعیت تعامل و پاسخگویی ادمین‌ها
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  'برای فروش گل‌های لوکس و هدیه سازمانی چه ایده‌ای داری که بتونیم با شرکت‌ها وارد مذاکره بشیم؟'
                )
              }
              className="text-[11px] bg-[#1a2334] hover:bg-[#25334c] text-slate-300 px-2.5 py-1 rounded-full border border-[#25334c] shrink-0 transition-colors"
            >
              💼 ایده برای هدیه سازمانی و جذب گل‌فروشان
            </button>
          </>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#0e1420] border-t border-[#1f293d] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`گفتگو و تبادل نظر با ${lead.name}...`}
          className="flex-1 bg-[#161f30] text-sm text-white px-4 py-2.5 rounded-xl border border-[#25334c] focus:outline-none focus:border-gold-400 placeholder:text-slate-500 transition-colors"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-black font-bold p-2.5 rounded-xl transition-colors shrink-0"
        >
          <Send className="w-5 h-5 rotate-180" />
        </button>
      </form>
    </div>
  );
}
