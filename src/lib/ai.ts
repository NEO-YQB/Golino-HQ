import { Department, ChatMessage, BoardroomMessage, BoardroomActionItem, TaskItem } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface LeadAIResponse {
  replyText: string;
  actionsTaken: string[];
  newTask?: {
    titleFa: string;
    contentFa: string;
    imageUrl?: string;
    assignedAgentName: string;
    targetChannels?: string[];
  };
}

export async function askDepartmentLead(
  department: Department,
  history: ChatMessage[],
  ceoPrompt: string
): Promise<LeadAIResponse> {
  const lead = department.leadAgent;

  let replyText = '';
  let actionsTaken: string[] = [];
  let newTask: LeadAIResponse['newTask'] | undefined = undefined;

  // 1. If Gemini API Key is provided, call Google Gemini REST API (gemini-3.5-flash-lite)
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const systemInstruction = `${lead.systemPrompt}
اطلاعات سازمان گلینو (golino.shop):
- پلتفرم تخصصی و مارکت‌پلیس گل و گیاه، دسته‌گل‌های لوکس، باکس‌های هدیه و ارسال فوری.
- شما در حال گفتگو با شخص مدیرعامل گلینو هستید.
- اعضای دپارتمان شما: ${department.members.map((m) => `${m.name} (${m.roleFa})`).join('، ')}.

وظایف مهم شما در پاسخگویی:
۱. فارسی بسیار روان، فاخر، محترمانه و قاطع بنویسید.
۲. کارهای مشخص را بین ادمین‌ها و اعضای تیم تقسیم کنید (امیر برای تلگرام و بله، پریا برای اینستاگرام و روبیکا، کیوان برای ایکس و لینکدین، مانی برای متن و سناریو، روژان برای تصویر و طراحی).
۳. در انتهای پیام حتماً بخشی با عنوان «اقدامات اجرایی:» بگذارید و هر اقدام را با خط تیره (-) شروع کنید.
۴. اگر مدیرعامل دستوری برای تولید پست، کمپین، تخفیف یا محتوا داد، در انتهای متن خود بخشی با عنوان «پیش‌نویس محتوای آماده تایید:» بگذارید و متن پیشنهادی کامل پست را با هشتگ‌ها بنویسید تا سیستم آن را به کارتابل تسک‌های مدیرعامل اضافه کند.`;

      const formattedHistory = history.slice(-6).map((msg) => ({
        role: msg.sender === 'ceo' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      formattedHistory.push({
        role: 'user',
        parts: [{ text: ceoPrompt }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
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
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        replyText = candidateText;

        // Parse Actions
        if (candidateText.includes('اقدامات اجرایی:')) {
          const parts = candidateText.split('اقدامات اجرایی:');
          const afterActions = parts[1].split('پیش‌نویس محتوای آماده تایید:')[0];
          const lines = afterActions.split('\n');
          for (const line of lines) {
            const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
            if (clean.length > 3) actionsTaken.push(clean);
          }
        }

        // Parse Draft Content if generated
        if (candidateText.includes('پیش‌نویس محتوای آماده تایید:')) {
          const draftText = candidateText.split('پیش‌نویس محتوای آماده تایید:')[1].trim();
          if (draftText.length > 10) {
            newTask = {
              titleFa: `محتوای شبکه‌های اجتماعی: ${ceoPrompt.slice(0, 45)}...`,
              contentFa: draftText,
              imageUrl: getCuratedFloralImage(ceoPrompt),
              assignedAgentName: 'پریا ویژوال و امیر پیام‌رسان',
              targetChannels: ['تلگرام', 'بله', 'اینستاگرام'],
            };
          }
        }
      }
    } catch (err) {
      console.error('Error invoking Gemini API:', err);
    }
  }

  // 2. Fallback if API response was empty or error
  if (!replyText) {
    replyText = `درود و احترام جناب مدیرعامل. پیام و دستور شما دریافت شد و بلافاصله در دستور کار دپارتمان ${department.nameFa} قرار گرفت.\n\nمن همین الان هماهنگی را با تیم آغاز کردم:
- مانی قلمی نگارش قلاب و سناریوی اصلی را شروع کرد.
- روژان دیزاین در حال خلق هویت بصری متناسب با برند گلینو است.
- امیر (ادمین تلگرام/بله) و پریا (ادمین اینستا/روبیکا) فرمت‌های انتشار و پاسخگویی به پیام‌های مخاطبان را آماده می‌کنند.

پیش‌نویس نهایی به همراه عکس و متن کامل تا ساعاتی دیگر در کارتابل تسک‌های شما قرار می‌گیرد تا پس از تایید نهایی شما منتشر شود.

اقدامات اجرایی:
- تدوین سناریو و تقویم اجرایی برای: ${ceoPrompt}
- ارجاع وظایف به ادمین‌های تلگرام، بله، اینستاگرام و روبیکا
- آماده‌سازی پیش‌نویس جهت تایید مدیرعامل`;

    actionsTaken = [
      `برنامه‌ریزی اجرایی برای دستور مدیرعامل`,
      `ارجاع سناریو به مانی قلمی (کپی‌رایتر)`,
      `ارجاع طراحی بصری به روژان دیزاین`,
      `آماده‌باش امیر پیام‌رسان و پریا ویژوال جهت بارگذاری`,
    ];

    newTask = {
      titleFa: `بسته محتوایی: ${ceoPrompt.slice(0, 40)}`,
      contentFa: `🌸 هدیه‌ای از جنس طراوت و عشق در گلینو\n\nبرای ثبت سفارش و ارسال فوری دسته‌گل‌های روز به سایت گلینو سر بزنید:\n🌐 golino.shop\n\n#گلینو #خرید_گل #دسته_گل_لوکس #ارسال_فوری`,
      imageUrl: getCuratedFloralImage(ceoPrompt),
      assignedAgentName: 'تیم محتوای سوشال مدیا',
      targetChannels: ['تلگرام', 'بله', 'اینستاگرام'],
    };
  }

  return {
    replyText,
    actionsTaken:
      actionsTaken.length > 0
        ? actionsTaken
        : [`ارجاع دستورات به اعضای دپارتمان ${department.nameFa}`],
    newTask,
  };
}

export function getCuratedFloralImage(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('رز') || p.includes('قرمز') || p.includes('عشق') || p.includes('ولنتاین')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';
  }
  if (p.includes('ارکیده') || p.includes('سفید') || p.includes('عروس')) {
    return 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=1000&q=80';
  }
  if (p.includes('باکس') || p.includes('جعبه') || p.includes('هدیه') || p.includes('لوکس')) {
    return 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1000&q=80';
  }
  // Default luxury floral
  return 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80';
}

export async function runBoardroomSimulation(
  topic: string,
  departments: Department[]
): Promise<{ messages: BoardroomMessage[]; actionItems: BoardroomActionItem[] }> {
  const messages: BoardroomMessage[] = [];
  const actionItems: BoardroomActionItem[] = [];

  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    const lead = dept.leadAgent;

    let text = '';
    let task = '';

    if (dept.id === 'social') {
      text = `در دپارتمان سوشال مدیا، ما این دستور را با ۶ ادمین در ۶ پلتفرم اجرا می‌کنیم: امیر برای تلگرام و بله کاتالوگ فروش را آماده می‌کند، پریا در اینستاگرام و روبیکا ریلز و استوری می‌زند، و کیوان در لینکدین و توییتر تعامل را آغاز می‌کند. روژان هم طراحی بصری لوکس را پیش می‌برد.`;
      task = `اجرای کمپین ۶ کاناله سوشال مدیا برای موضوع: ${topic}`;
    } else if (dept.id === 'seo') {
      text = `از منظر دپارتمان سئو، ما لندینگ پیج تخصصی مرتبط با «${topic}» را با اسکیما کامل و کلمات کلیدی پرجستجوی گوگل آماده می‌کنیم تا ورودی ارگانیک همزمان با سوشال رشد کند.`;
      task = `تولید لندینگ پیج و سئو ساختار برای: ${topic}`;
    } else if (dept.id === 'support') {
      text = `تیم پشتیبانی برای پاسخگویی به استعلامات و راهنمایی خریداران پیرامون «${topic}» در آماده‌باش کامل قرار می‌گیرد.`;
      task = `آموزش بات پشتیبان و سناریوی پاسخگویی ۲۴/۷ برای: ${topic}`;
    } else if (dept.id === 'vendors') {
      text = `ما هماهنگی با گل‌فروشی‌های تامین‌کننده در سراسر کشور را انجام می‌دهیم تا کیفیت گل‌ها و سرعت ارسال ۱ ساعته تضمین شود.`;
      task = `بررسی ظرفیت و کیفیت گل‌فروشان برای: ${topic}`;
    } else {
      text = `دپارتمان ما وظایف محوله را دریافت کرد و همراه با سایر دپارتمان‌ها هماهنگی کامل را برای خروجی ایده‌آل خواهد داشت.`;
      task = `پیگیری و هماهنگی سازمانی: ${topic}`;
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
