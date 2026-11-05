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
  const actionsTaken: string[] = [];
  let newTask: LeadAIResponse['newTask'] | undefined = undefined;

  // 1. If Gemini API Key is provided, call Google Gemini REST API (gemini-3.5-flash-lite)
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const systemInstruction = `تو «${lead.name}»، ${lead.roleFa} در گلینو (golino.shop) هستی.
طرف گفتگوی مستقیم تو «افشین» (مدیرعامل و بنیان‌گذار گلینو) است.

اصول کلیدی گفتگو:
۱. نام او «افشین» است. صمیمی، محترمانه، زنده و کاملاً دوستانه و طبیعی صحبت کن (مثل: «افشین جان»، «آقا افشین»).
۲. به هیچ وجه ساختار خشک، اداری یا قالبی نگیر! هیچ جواب آماده، لیست کلیشه‌ای، عنوان «اقدامات اجرایی»، یا تفکیک وظایف ساختگی ننویس.
۳. خیلی آزادانه، صادقانه و تحلیلی گپ بزن؛ درست مثل دو همکار و مدیر ارشد که روبه‌روی هم نشستن و دارن با هم فکر و تبادل نظر می‌کنن.
۴. اگر با ایده‌ای موافقی یا مخالفی، نظرت رو صریح، منطقی و با استدلال واقعی بگو و از دیدگاه تخصصی خودت ایده بده.
۵. لحنت کاملاً طبیعی، روان، فارسی سلیس و بدون لحن رباتی، فرمالیته یا منشی‌مآبانه باشه.

پیش‌زمینه و تخصص تو:
${lead.systemPrompt || lead.specialtyFa || ''}`;

      const formattedHistory = history.slice(-8).map((msg) => ({
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
              temperature: 0.85,
              maxOutputTokens: 1400,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        replyText = candidateText;

        // Auto-detect if there's a concrete ready draft created
        if (candidateText.includes('پیش‌نویس محتوا:') || candidateText.includes('متن پیشنهادی:')) {
          const parts = candidateText.split(/پیش‌نویس محتوا:|متن پیشنهادی:/);
          const draftText = parts[1]?.trim()?.slice(0, 500);
          if (draftText && draftText.length > 20) {
            newTask = {
              titleFa: `محتوای تایید شده با افشین: ${ceoPrompt.slice(0, 40)}`,
              contentFa: draftText,
              imageUrl: getCuratedFloralImage(ceoPrompt),
              assignedAgentName: department.id === 'social' ? 'تیم محتوای سوشال' : 'تیم سئو',
              targetChannels: ['تلگرام', 'بله', 'اینستاگرام'],
            };
          }
        }
      }
    } catch (err) {
      console.error('Error invoking Gemini API:', err);
    }
  }

  // 2. Realistic conversational fallback if API is not yet reached
  if (!replyText) {
    if (department.id === 'social') {
      replyText = `سلام افشین جان، وقتت بخیر.\n\nدر مورد موضوعی که مطرح کردی («${ceoPrompt}»)، به نظرم پتانسیل تعامل خیلی خوبی داره. الان توی اینستاگرام ویدیوهای پشت‌صحنه ساخت دسته‌گل و باکس‌ها عالی جواب میدن و توی تلگرام هم عکس‌های تمیز با قیمت مشخص و تخفیف سریع‌ترین بازدهی رو دارن.\n\nمی‌خوای اول روی هدیه‌های فوری و مناسبتی تستش کنیم یا روی خرید‌های شرکتی و سازمانی؟`;
    } else if (department.id === 'seo') {
      replyText = `سلام افشین جان، در مورد «${ceoPrompt}» اتفاقاً سرچ کلماتش توی تهران حجم خوبی داره. ما ۵ تا مقاله پایه‌ای رو بستیم و اگر این بخش رو هم بیاریم روی سایت و به صفحات محصول لینک کنیم، ورودی خرید باارزشی از گوگل می‌گیریم.\n\nبه نظرت روی کلمات لانگ‌تیل قیمتی بریم جلو یا راهنمای انتخاب گل؟`;
    } else if (department.id === 'support') {
      replyText = `سلام افشین جان، در رابطه با «${ceoPrompt}»، مهم‌ترین مسئله اینه که هماهنگی ارسال فوری دقیق باشه تا استرس خریدار برای رسیدن گل سر ساعت برطرف بشه. از نظر تیم پشتیبانی همه چیز تحت کنترله و آماده‌ایم.`;
    } else if (department.id === 'vendors') {
      replyText = `سلام افشین جان، در مورد «${ceoPrompt}»، تامین‌کننده‌های اصلی گل در تهران ظرفیت شاخه‌های باکیفیت و تازه رو دارن. فقط باید نظارت کنیم که عکس محصولات در پنل دقیقاً با گل تحویلی یکی باشه تا مغایرت نخوریم.`;
    } else {
      replyText = `سلام افشین جان، پیام تو رو خوندم. در مورد «${ceoPrompt}» کاملاً آماده‌ام که هم‌فکری کنیم و بهترین مسیر رو براش بچینیم. نظرت چیه؟`;
    }
  }

  return {
    replyText,
    actionsTaken,
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
      text = `افشین جان، از دیدگاه سوشال مدیا موضوع «${topic}» پتانسیل وایرال شدن خیلی خوبی داره. من پیشنهاد می‌کنم یک کمپین دو فازی بریم: اول یک چالش تعاملی با جایزه سبد گل لوکس برای تلگرام و اینستاگرام، و بعد انتشار کاتالوگ فروش با تخفیف محدود. امیر و پریا هم ادمینی دایرکت‌ها رو برای تبدیل لیدها پوشش می‌دن.`;
      task = `برنامه‌ریزی و اجرای کمپین شبکه‌های اجتماعی برای: ${topic}`;
    } else if (dept.id === 'seo') {
      text = `کاملاً با سارا موافقم، ولی افشین جان حواسمون باشه که موج سوشال موقتیه. ما باید در سئو یک لندینگ دائمی بسازیم که بعد از اتمام کمپین هم ماهانه ورودی ارگانیک مداوم برامون بیاره. من با نگار روی ساختار محتوایی و با کیان روی اسکیما کار رو استارت می‌زنیم.`;
      task = `طراحی لندینگ پیج اورگانیک و کلمات کلیدی برای: ${topic}`;
    } else if (dept.id === 'support') {
      text = `نکته خیلی مهم در مورد «${topic}» اینه که با شروع این کمپین، حجم استعلام قیمت و سوالات در مورد ساعت دقیق تحویل گل بالا میره. تیم پشتیبانی باید آماده باشه تا میانگین زمان پاسخگویی رو زیر ۳ دقیقه نگه داره که انصراف از خرید پیش نیاد.`;
      task = `آماده‌سازی سناریوی پاسخگویی فوری و پشتیبانی کمپین: ${topic}`;
    } else if (dept.id === 'vendors') {
      text = `من هم از سمت گل‌فروشی‌ها خیالتون رو راحت می‌کنم افشین جان. قبل از لانچ کمپین، ظرفیت تامین گل‌های تازه و بسته‌بندی‌های لوکس گلینو رو با ۱۰ فروشنده برتر تهران و شهرستان‌ها فیکس می‌کنم تا مشکلی در تحویل نداشته باشیم.`;
      task = `تضمین کیفیت و ظرفیت گل‌فروشان برای کمپین: ${topic}`;
    } else {
      text = `من هم در هماهنگی کامل با سایر مدیران هستم تا این طرح به بهترین شکل ممکن پیاده بشه.`;
      task = `هماهنگی اجرایی: ${topic}`;
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
