import { Department, ChatMessage, BoardroomMessage, BoardroomActionItem } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface LeadAIResponse {
  replyText: string;
  actionsTaken: string[];
}

export async function askDepartmentLead(
  department: Department,
  history: ChatMessage[],
  ceoPrompt: string
): Promise<LeadAIResponse> {
  const lead = department.leadAgent;

  // If Gemini API Key is provided, call Google Gemini REST API
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const systemInstruction = `${lead.systemPrompt}
اطلاعات مهم گلینو:
گلینو یک مارکت‌پلیس لوکس آنلاین خرید گل و گیاه در ایران است. شما با مدیرعامل (کاربر) در جلسه اختصاصی صحبت می‌کنید.
اعضای تیم شما: ${department.members.map((m) => `${m.name} (${m.roleFa})`).join('، ')}.
وظیفه شما:
۱. پاسخ محترمانه، روشن، به زبان فارسی روان و کاملاً راست‌چین و بدون اصطلاحات مبهم.
۲. اگر مدیرعامل ایرادی گرفت یا فیدبکی داد (مثلاً خطای عدم چک نهایی، مشکل در پست، تاخیر)، بلافاصله مسئولیت را بپذیر، دلیل فنی یا اجرایی را بگو و توضیح بده که دقیقاً کدام کار به کدام عضو تیمت ارجاع شد تا برطرف شود.
۳. در انتهای پاسخت، اقداماتی که فوراً برای اجرای دستور مدیرعامل انجام دادی را در قالب یک بخش با عنوان «اقدامات اجرایی:» لیست کن.`;

      const formattedHistory = history.slice(-6).map((msg) => ({
        role: msg.sender === 'ceo' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      formattedHistory.push({
        role: 'user',
        parts: [{ text: ceoPrompt }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedHistory,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract actions taken if present
        const actions: string[] = [];
        if (candidateText.includes('اقدامات اجرایی:')) {
          const parts = candidateText.split('اقدامات اجرایی:');
          const actionsPart = parts[1];
          const lines = actionsPart.split('\n');
          for (const line of lines) {
            const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
            if (clean.length > 3) actions.push(clean);
          }
        }

        return {
          replyText: candidateText,
          actionsTaken:
            actions.length > 0
              ? actions
              : [`ارجاع دستور به اعضای دپارتمان ${department.nameFa}`, 'ثبت لاگ در کارتابل تیم'],
        };
      }
    } catch (err) {
      console.error('Error invoking Gemini API:', err);
    }
  }

  // Realistic Intelligent Fallback when API key is not yet set
  const lowerPrompt = ceoPrompt.toLowerCase();
  let reply = `سلام و احترام جناب مدیرعامل. پیام و دستور شما را با دقت دریافت کردم.\n\n`;
  const actions: string[] = [];

  if (
    lowerPrompt.includes('ایراد') ||
    lowerPrompt.includes('اشتباه') ||
    lowerPrompt.includes('چک') ||
    lowerPrompt.includes('اصلاح') ||
    lowerPrompt.includes('مشکل')
  ) {
    reply += `کاملاً متوجه حساسیت موضوع شدم و بابت این نقص در خروجی عذرخواهی می‌کنم. بررسی کردم و مشخص شد که در گیت ممیزی پیش از نهایی‌سازی، بازبینی کامل انجام نشده بود.\n\nمن همین الان دستور توقف فرایند را صادر کردم و مستقیماً تسک اصلاح فوری را با اولویت بحرانی (Urgent) به اعضای مسئول تیم ارجاع دادم. تا ساعاتی دیگر نسخه کاملاً اصلاح‌شده و باکیفیت را مجدداً برای شما ارسال خواهیم کرد تا شخصاً تایید بفرمایید.`;
    actions.push(`ایجاد تسک اصلاح فوری برای اعضای دپارتمان ${department.nameFa}`);
    actions.push('فعال‌سازی چک‌لیست دو مرحله‌ای پیش از انتشار');
    actions.push('آماده‌سازی پیش‌نویس جدید جهت رویت مدیرعامل');
  } else if (
    lowerPrompt.includes('برنامه') ||
    lowerPrompt.includes('کجا') ||
    lowerPrompt.includes('وضعیت') ||
    lowerPrompt.includes('چند')
  ) {
    reply += `گزارش وضعیت لحظه‌ای دپارتمان ${department.nameFa}:\nهم‌اکنون تیم با تمام ظرفیت مشغول اجرای صف تسک‌هاست. اعضای تیم هر کدام وظایف محوله را طبق تایم‌لاین پیش می‌برند و تمام موانع برطرف شده است. گزارش مشروح کارهای انجام‌شده نیز در بخش گزارش‌های دوره‌ای برای شما آپلود شده است.`;
    actions.push('بروزرسانی وضعیت صف تسک‌ها');
    actions.push('همگام‌سازی زمان‌بندی با سرور اصلی');
  } else {
    reply += `دستور شما در دستور کار مستقیم دپارتمان ${department.nameFa} قرار گرفت. سناریو و جزئیات اجرایی را با بچه‌های تیم در میان گذاشتم و بر خروجی کار نظارت مستقیم خواهم داشت تا با بالاترین استانداردهای برند لوکس گلینو تحویل شما گردد.`;
    actions.push(`تعریف تسک جدید بر اساس بیانات مدیرعامل`);
    actions.push('تخصیص منابع به اعضای فعال تیم');
  }

  return {
    replyText: reply,
    actionsTaken: actions,
  };
}

export async function runBoardroomSimulation(
  topic: string,
  departments: Department[]
): Promise<{ messages: BoardroomMessage[]; actionItems: BoardroomActionItem[] }> {
  const messages: BoardroomMessage[] = [];
  const actionItems: BoardroomActionItem[] = [];

  // Simulate or generate lively cross-department dialogue
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    const lead = dept.leadAgent;

    let text = '';
    let task = '';

    if (dept.id === 'seo') {
      text = `از منظر دپارتمان سئو، برای موضوع «${topic}»، ما بررسی کردیم که پتانسیل جستجوی بسیار بالایی در سرچ گوگل وجود دارد. من به نگار و کامران در تیمم دستور می‌دهم که کلمات کلیدی هدف و لندینگ پیج اختصاصی با اسکیما کامل رو ظرف ۲۴ ساعت آماده کنند.`;
      task = `تدوین لندینگ پیج سئو و کلمات کلیدی برای موضوع: ${topic}`;
    } else if (dept.id === 'social') {
      text = `بسیار عالی! در دپارتمان سوشال مدیا، ما این موضوع را در قالب یک کمپین ۳ مرحله‌ای (تیزر، انتشار اصلی و مسابقه تعاملی) برای تلگرام، بله و اینستاگرام لانچ می‌کنیم. هماهنگی محتوا و عکس‌های گل‌ها را هم با ربات انتشار ست خواهیم کرد.`;
      task = `طراحی سناریو و تقویم انتشار شبکه‌های اجتماعی برای: ${topic}`;
    } else if (dept.id === 'support') {
      text = `تیم پشتیبانی هم در این بازه کاملاً در حالت آماده‌باش قرار می‌گیرد تا اگر سوالی درباره شرایط سفارش، قیمت‌ها یا ارسال فوری در گلینو بود، پاسخگویی زیر ۵ دقیقه صورت گیرد.`;
      task = `تدوین پرسش‌های متداول و آموزش پاسخگوی هوشمند برای: ${topic}`;
    } else if (dept.id === 'vendors') {
      text = `ما نیز فوراً با گل‌فروشی‌های برتر عضو گلینو در تهران و شهرستان‌ها هماهنگ می‌کنیم تا موجودی گل‌های تازه و بسته‌بندی‌های لوکس متناسب با این طرح تضمین شود.`;
      task = `اطلاع‌رسانی به فروشندگان برتر و بررسی ظرفیت ارسال برای: ${topic}`;
    } else {
      text = `دپارتمان ما وظایف مربوطه را دریافت کرد و همراه با سایر دپارتمان‌ها هماهنگی کامل را برای خروجی ایده‌آل خواهد داشت.`;
      task = `پیگیری و هماهنگی درون‌سازمانی پیرامون: ${topic}`;
    }

    messages.push({
      id: `bm-${Date.now()}-${i}`,
      senderDeptId: dept.id,
      senderName: lead.name,
      senderRoleFa: lead.roleFa,
      text,
      timestamp: 'چند لحظه پیش',
    });

    actionItems.push({
      id: `act-${Date.now()}-${i}`,
      taskFa: task,
      assignedDeptId: dept.id,
      assignedDeptNameFa: dept.nameFa,
      status: 'pending',
    });
  }

  return { messages, actionItems };
}
