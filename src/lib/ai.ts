import { Department, ChatMessage, BoardroomMessage, BoardroomActionItem, TaskItem } from '@/types';
import {
  getTasksByTag,
  saveTask,
  updateTaskStatusInStorage,
  getSchedules,
} from '@/lib/storage';
import { getTodayPersianDate } from '@/lib/persianDate';

const DEPARTMENT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'getDepartmentTasks',
        description: 'دریافت لیست تسک‌های جاری و در حال اجرای یک دپارتمان بر اساس تگ واحد (تسک‌منیجر تگ‌محور MCP)',
        parameters: {
          type: 'OBJECT',
          properties: {
            tag: {
              type: 'STRING',
              description: 'برچسب اختصاصی دپارتمان: seo برای سئو، social برای سوشال، support برای پشتیبانی، vendors برای تامین‌کنندگان',
            },
            status: {
              type: 'STRING',
              description: 'فیلتر وضعیت: all (همه)، pending (در انتظار)، in_progress (در حال اجرا)، completed (تکمیل‌شده)',
            },
          },
          required: ['tag'],
        },
      },
      {
        name: 'createDepartmentTask',
        description: 'ایجاد و ثبت یک تسک اجرایی جدید در دپارتمان با عنوان، اولویت و موعد شمسی',
        parameters: {
          type: 'OBJECT',
          properties: {
            tag: {
              type: 'STRING',
              description: 'برچسب دپارتمان مربوطه (seo, social, support, vendors)',
            },
            titleFa: {
              type: 'STRING',
              description: 'عنوان دقیق تسک به فارسی',
            },
            priority: {
              type: 'STRING',
              description: 'اولویت تسک: low, medium, high, urgent',
            },
            assignedAgentName: {
              type: 'STRING',
              description: 'نام مسئول اجرای تسک',
            },
            dueDateFa: {
              type: 'STRING',
              description: 'تاریخ موعد انجام به شمسی (مثلاً ۱۴۰۵/۰۸/۲۵)',
            },
            notesFa: {
              type: 'STRING',
              description: 'نکات تکمیلی و دستورالعمل اجرایی',
            },
          },
          required: ['tag', 'titleFa'],
        },
      },
      {
        name: 'updateTaskStatus',
        description: 'بروزرسانی وضعیت تسک در تسک‌منیجر (تغییر به completed یا in_progress)',
        parameters: {
          type: 'OBJECT',
          properties: {
            taskId: {
              type: 'STRING',
              description: 'شناسه تسک',
            },
            status: {
              type: 'STRING',
              description: 'وضعیت جدید: completed یا in_progress یا pending',
            },
          },
          required: ['taskId', 'status'],
        },
      },
      {
        name: 'getDepartmentSchedules',
        description: 'پایش برنامه‌های زمان‌بندی چند مرحله‌ای واحد، گام‌های تکمیل‌شده و موعدهای پیش‌رو به تاریخ شمسی',
        parameters: {
          type: 'OBJECT',
          properties: {
            tag: {
              type: 'STRING',
              description: 'برچسب دپارتمان: seo, social, support, vendors',
            },
          },
          required: ['tag'],
        },
      },
    ],
  },
];

async function executeDepartmentTool(
  toolName: string,
  args: any,
  defaultDeptId: string
): Promise<{ result: any; actionDescription: string; newTask?: TaskItem }> {
  const cleanTag = (args.tag || defaultDeptId).replace(/^#/, '').toLowerCase();

  if (toolName === 'getDepartmentTasks') {
    const tasks = await getTasksByTag(cleanTag, args.status);
    const summary = tasks.slice(0, 10).map((t) => ({
      id: t.id,
      title: t.titleFa,
      status: t.status,
      assignedTo: t.assignedAgentName,
      dueDateFa: t.dueDateFa,
      notes: t.notesFa,
    }));
    return {
      result: { count: summary.length, tag: cleanTag, tasks: summary },
      actionDescription: `بررسی تسک‌های واحد #${cleanTag} (${summary.length} تسک یافت شد)`,
    };
  }

  if (toolName === 'createDepartmentTask') {
    const taskId = `task-${Date.now()}`;
    const newTask: TaskItem = {
      id: taskId,
      titleFa: args.titleFa,
      departmentId: cleanTag,
      departmentNameFa:
        cleanTag === 'seo'
          ? 'دپارتمان سئو و محتوا'
          : cleanTag === 'social'
          ? 'دپارتمان شبکه‌های اجتماعی'
          : cleanTag === 'vendors'
          ? 'امور تامین‌کنندگان'
          : 'پشتیبانی و CRM',
      assignedAgentName: args.assignedAgentName || 'مدیر دپارتمان',
      status: 'in_progress',
      priority: args.priority || 'medium',
      createdAt: getTodayPersianDate(),
      dueDateFa: args.dueDateFa || 'تعیین‌نشده',
      notesFa: args.notesFa,
    };
    await saveTask(newTask);
    return {
      result: { success: true, taskId, title: args.titleFa },
      actionDescription: `ثبت تسک جدید در واحد #${cleanTag}: «${args.titleFa}»`,
      newTask,
    };
  }

  if (toolName === 'updateTaskStatus') {
    const updated = await updateTaskStatusInStorage(args.taskId, args.status);
    return {
      result: { success: !!updated, taskId: args.taskId, newStatus: args.status },
      actionDescription: `تغییر وضعیت تسک ${args.taskId} به ${args.status}`,
    };
  }

  if (toolName === 'getDepartmentSchedules') {
    const schedules = await getSchedules(cleanTag);
    const summary = schedules.map((s) => ({
      id: s.id,
      title: s.titleFa,
      progressPercent: s.progressPercent,
      steps: s.steps.map((st) => ({
        stepNumber: st.stepNumber,
        title: st.titleFa,
        status: st.status,
        targetDateFa: st.targetDateFa,
        completedDateFa: st.completedDateFa,
      })),
    }));
    return {
      result: { count: summary.length, tag: cleanTag, schedules: summary },
      actionDescription: `پایش زمان‌بندی‌های چند مرحله‌ای واحد #${cleanTag}`,
    };
  }

  return { result: { error: 'Unknown tool' }, actionDescription: `ابزار نامشخص ${toolName}` };
}

export async function askDepartmentLead(
  department: Department,
  history: ChatMessage[],
  ceoPrompt: string,
  _ignoredDepartmentKnowledge?: string
): Promise<{ replyText: string; newTask?: TaskItem; actionsTaken?: string[] }> {
  const lead = department.leadAgent;
  let replyText = '';
  let newTask: TaskItem | undefined = undefined;
  const actionsTaken: string[] = [];

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    replyText = `⚠️ افشین جان، ارتباط من با مغز هوش مصنوعی (Gemini API) هنوز برقرار نشده، چون متغیر محیطی GEMINI_API_KEY در تنظیمات کولایفای (Coolify) وارد نشده یا بعد از ذخیره، کانتینر Redeploy نشده است.\n\nلطفاً در تب Environment Variables کولایفای، کلید GEMINI_API_KEY را ثبت و پروژه را Redeploy کن تا فوراً شروع به صحبت کنیم.`;
    return { replyText, newTask, actionsTaken };
  }

  try {
    const deptTag = department.id.toLowerCase();

    // Ultra-slim, token-efficient system instruction (~90 tokens instead of 3,500+)
    const systemInstruction = `تو «${lead.name}» هستی، ${lead.roleFa} در مارکت‌پلیس گلینو (golino.shop).
دپارتمان تو: «${department.nameFa}» (برچسب واحد: #${deptTag}).
طرف گفتگوی مستقیم تو «افشین» (مدیرعامل و بنیان‌گذار گلینو) است.

اصول رفتار و گفتگو:
- به عنوان یک همکار ارشد، متخصص، کاملاً طبیعی، صمیمی و بدون هیچ قالب یا چارچوب اداری گفتگو کن.
- برای مدیریت تسک‌ها و زمان‌بندی‌ها، یک ابزار متصل به تسک‌منیجر تگ‌محور گلینو (MCP Tools) در اختیارت است.
- فقط در صورتی که افشین درباره کارها، برنامه‌ها یا وظایف سوال کرد، از ابزار getDepartmentTasks یا getDepartmentSchedules با تگ واحدت (tag: "${deptTag}") استفاده کن. کارهای سایر واحدها را بررسی نکن.
- اگر نیاز شد تسکی بسازی، از createDepartmentTask استفاده کن.
- آزادانه بشنو، تحلیل کن و یک گفتگوی انسانی و روان داشته باش.`;

    // Build clean alternating history for Gemini: strictly user -> model -> user -> model -> user
    const contents: any[] = [];
    const validHistory = history.filter((m) => m.text && m.text.trim().length > 0).slice(-8);

    for (const msg of validHistory) {
      const role = msg.sender === 'ceo' ? 'user' : 'model';

      if (contents.length === 0 && role === 'model') continue;

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text = msg.text;
      } else {
        contents.push({ role, parts: [{ text: msg.text }] });
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text = ceoPrompt;
    } else {
      contents.push({ role: 'user', parts: [{ text: ceoPrompt }] });
    }

    const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              tools: DEPARTMENT_TOOLS,
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const firstCandidate = data.candidates?.[0];
          const parts = firstCandidate?.content?.parts || [];

          // Check if Gemini invoked an MCP tool
          const functionCallPart = parts.find((p: any) => p.functionCall);

          if (functionCallPart && functionCallPart.functionCall) {
            const fCall = functionCallPart.functionCall;
            const toolExec = await executeDepartmentTool(fCall.name, fCall.args || {}, deptTag);

            actionsTaken.push(toolExec.actionDescription);
            if (toolExec.newTask) {
              newTask = toolExec.newTask;
            }

            // Append model function call turn and tool response turn
            contents.push({
              role: 'model',
              parts: parts,
            });

            contents.push({
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    name: fCall.name,
                    response: toolExec.result,
                  },
                },
              ],
            });

            // Second roundtrip to obtain natural conversational explanation
            const followUpRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents,
                  tools: DEPARTMENT_TOOLS,
                  systemInstruction: {
                    parts: [{ text: systemInstruction }],
                  },
                  generationConfig: {
                    temperature: 0.85,
                    maxOutputTokens: 1000,
                  },
                }),
              }
            );

            if (followUpRes.ok) {
              const followUpData = await followUpRes.json();
              const textPart = followUpData.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
              if (textPart && textPart.text) {
                replyText = textPart.text;
                break;
              }
            }
          }

          // If standard text without function call
          const plainText = parts.find((p: any) => p.text)?.text;
          if (plainText && plainText.trim().length > 0) {
            replyText = plainText;
            break;
          }
        } else {
          const errorText = await response.text();
          console.warn(`Gemini model ${model} returned error ${response.status}:`, errorText);
          lastError = `خطای ${response.status}: ${errorText.slice(0, 150)}`;
          if (response.status === 503 || response.status === 429) {
            continue;
          }
        }
      } catch (callErr: any) {
        console.warn(`Gemini model ${model} fetch exception:`, callErr);
        lastError = callErr?.message || String(callErr);
      }
    }

    if (!replyText && lastError) {
      replyText = `⚠️ افشین جان، ارتباط با سرویس هوش مصنوعی گوگل با اختلال موقت مواجه شد (${lastError}). لطفاً مجدداً پیام بده.`;
    }
  } catch (err: any) {
    console.error('Error invoking Gemini API:', err);
    replyText = `⚠️ افشین جان، در برقراری تماس با سرور هوش مصنوعی خطایی رخ داد: ${err?.message || err}`;
  }

  if (!replyText) {
    replyText = `افشین جان، در این لحظه پاسخی دریافت نشد؛ لطفاً پیامت را مجدداً ارسال کن.`;
  }

  return { replyText, newTask, actionsTaken };
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
