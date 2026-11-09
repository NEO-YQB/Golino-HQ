'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  CheckSquare,
  FileText,
  Bell,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/escalations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unread = data.filter((item) => item.status === 'unread').length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/departments', label: 'دپارتمان‌ها', icon: Building2 },
    { href: '/schedules', label: 'زمان‌بندی‌ها', icon: CalendarDays },
    { href: '/boardroom', label: 'هیئت‌مدیره', icon: Users },
    { href: '/tasks', label: 'صف تسک‌ها', icon: CheckSquare },
    { href: '/reports', label: 'گزارش‌ها', icon: FileText },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0f17]/90 backdrop-blur-md border-b border-[#1f293d]/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 flex items-center justify-center shadow-lg shadow-gold-500/10">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">GOLINO HQ</span>
                <span className="text-[10px] bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded-full font-medium border border-gold-400/20">
                  مدیریت عامل
                </span>
              </div>
              <p className="text-[11px] text-hq-muted">کنسول راهبری ایجنت‌های گلینو</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121824] p-1 rounded-xl border border-[#1f293d]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-400 font-bold border border-gold-500/30'
                      : 'text-hq-muted hover:text-white hover:bg-[#1a2334]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#121824] px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-emerald-400 font-medium">سرور فعال</span>
            </div>

            <Link
              href="/escalations"
              className="relative p-2 rounded-xl bg-[#121824] hover:bg-[#1a2334] border border-[#1f293d] transition-colors"
              title="پیام‌های مستقیم و خطاهای اضطراری"
            >
              <Bell className="w-4 h-4 text-hq-muted hover:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile / Tablet */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f17]/95 backdrop-blur-lg border-t border-[#1f293d] px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-gold-400 bg-gold-400/10 font-bold'
                    : 'text-hq-muted hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
