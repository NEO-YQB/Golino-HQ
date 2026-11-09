/**
 * Persian (Solar Hijri) Date Utility for Golino HQ
 */

export function getTodayPersianDate(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'persian',
    }).format(new Date());
  } catch {
    return '۱۴۰۵/۰۸/۱۵';
  }
}

export function formatToPersianDate(date: Date | string | number): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'persian',
    }).format(d);
  } catch {
    return String(date);
  }
}

export function toPersianDigits(input: string | number): string {
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function fromPersianDigits(str: string): string {
  const persianDigits: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  return str.replace(/[۰-۹]/g, (w) => persianDigits[w] || w);
}
