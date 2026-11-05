import { Department, ChatMessage, BoardroomMessage, BoardroomActionItem, TaskItem } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function askDepartmentLead(
  department: Department,
  history: ChatMessage[],
  ceoPrompt: string,
  departmentKnowledge?: string
): Promise<{ replyText: string; newTask?: TaskItem }> {
  const lead = department.leadAgent;
  let replyText = '';
  let newTask: TaskItem | undefined = undefined;

  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      let systemInstruction = `تو «${lead.name}» هستی، ${lead.roleFa} در مارکت‌پلیس گلینو (golino.shop).
تخصص تو: ${lead.systemPrompt || lead.specialtyFa || ''}

طرف گفتگوی تو «افشین» (مدیرعامل و بنیان‌گذار گلینو) است.
- با افشین به عنوان یک همکار ارشد، متخصص، کاملاً طبیعی، صمیمی و بدون هیچ قالب یا کلیشه‌ای گفتگو کن.
- آزادانه بشنو، تحلیل کن، نظرت را بگو و تبادل نظر کن.
- اصلاً و ابداً در قالب‌های اداری یا جواب‌های کلیشه‌ای نرو. نیازی به لیست کردن کارها یا ساختن وظایف نیست؛ فقط یک گفتگوی انسانی، هوشمندانه و آزاد داشته باش.`;

      if (departmentKnowledge && departmentKnowledge.trim().length > 0) {
        systemInstruction += `\n\n📌 اطلاعات و پیش‌زمینه دپارتمان تو در سیستم:\n${departmentKnowledge}`;
      }

      // Build clean history for Gemini: strictly user -> model -> user -> model
      const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
      const validHistory = history.filter((m) => m.text && m.text.trim().length > 0).slice(-10);

      for (const msg of validHistory) {
        const role = msg.sender === 'ceo' ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n\n${msg.text}`;
        } else {
          contents.push({ role, parts: [{ text: msg.text }] });
        }
      }

      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n\n${ceoPrompt}`;
      } else {
        contents.push({ role: 'user', parts: [{ text: ceoPrompt }] });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (err) {
      console.error('Error invoking Gemini API:', err);
    }
  }

  // Natural fallback if API key is not reached
  if (!replyText) {
    if (department.id === 'social') {
      replyText = `سلام افشین جان. در مورد موضوعی که گفتی، به نظرم می‌تونیم زاویه دید خیلی جالب‌تری بهش داشته باشیم و روش مانور بدیم. نظرت چیه قبل از هر تصمیمی، یه بار بازخورد مخاطب‌ها رو بسنجیم؟`;
    } else if (department.id === 'seo') {
      replyText = `سلام افشین جان. در مورد این موضوع بررسی کردم؛ پتانسیل خوبی داره ولی باید ببینیم چقدر با استراتژی کلی سئوی این ماهمون هماهنگه. نظرت روی اولویت‌بندیش چیه؟`;
    } else {
      replyText = `سلام افشین جان. نکته‌ات رو گرفتم و کاملاً قابل بحثه. بگو از چه زاویه‌ای بیشتر مدنظرته تا عمیق‌تر بررسیش کنیم.`;
    }
  }

  // Only create a task if Afshin explicitly requested it in text
  const lower = ceoPrompt.toLowerCase();
  if (lower.includes('تسک کن') || lower.includes('تسک بساز') || lower.includes('ثبت تسک') || lower.includes('به تسک ها اضافه کن')) {
    newTask = {
      id: `task-${Date.now()}`,
      titleFa: ceoPrompt.slice(0, 50),
      departmentId: department.id,
      departmentNameFa: department.nameFa,
      assignedAgentName: lead.name,
      status: 'in_progress',
      priority: 'medium',
      createdAt: 'امروز',
      dueDateFa: 'تعیین‌نشده',
      notesFa: `ثبت‌شده به دستور صریح افشین در گفتگو`,
    };
  }

  return { replyText, newTask };
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
      text = `افشین جان، از نگاه سوشال مدیا موضوع «${topic}» می‌تونه خیلی جذاب باشه. باید ببینیم روی کدوم شبکه‌ها بهتر جواب می‌ده.`;
      task = `برنامه‌ریزی شبکه‌های اجتماعی برای: ${topic}`;
    } else if (dept.id === 'seo') {
      text = `افشین جان، من هم از دیدگاه سئو موافقم؛ باید همزمان با موج شبکه‌های اجتماعی، لندینگ پیجش رو هم غنی کنیم.`;
      task = `بررسی ساختار سئو برای: ${topic}`;
    } else if (dept.id === 'support') {
      text = `از سمت تیم پشتیبانی هم آمادگی کامل رو داریم تا به هر سوال یا ابهامی پاسخ بدیم.`;
      task = `هماهنگی تیم پشتیبانی برای: ${topic}`;
    } else if (dept.id === 'vendors') {
      text = `من هم از سمت تامین‌کنندگان پیگیری می‌کنم تا کیفیت گل‌ها تضمین بشه.`;
      task = `هماهنگی با گل‌فروشان برای: ${topic}`;
    } else {
      text = `در هماهنگی کامل هستیم افشین جان.`;
      task = `پیگیری اجرایی: ${topic}`;
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
