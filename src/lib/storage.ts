import fs from 'fs';
import path from 'path';
import {
  Department,
  TaskItem,
  ExecutiveReport,
  EscalationMessage,
  ChatMessage,
  BoardroomSession,
  DepartmentSchedule,
  ScheduleStep,
} from '@/types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_TASKS,
  INITIAL_REPORTS,
  INITIAL_ESCALATIONS,
  INITIAL_CHAT_HISTORY,
  INITIAL_SCHEDULES,
} from './data';
import { prisma, isDbConnected } from './prisma';
import { getTodayPersianDate } from './persianDate';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore
    }
  }
}

function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filename: string, data: T) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// -------------------------------------------------------------
// Departments
// -------------------------------------------------------------
export async function getDepartments(): Promise<Department[]> {
  if (isDbConnected()) {
    try {
      const depts = await prisma.department.findMany({
        include: { members: true },
      });
      if (depts.length > 0) {
        return depts.map((d) => {
          const lead = d.members.find((m) => m.isLead) || d.members[0];
          const regulars = d.members.filter((m) => !m.isLead);
          return {
            id: d.id,
            name: d.name,
            nameFa: d.nameFa,
            descriptionFa: d.descriptionFa,
            icon: d.icon,
            color: d.color,
            status: d.status as any,
            activeTasksCount: d.activeTasksCount,
            errorCount: d.errorCount,
            leadAgent: {
              id: lead?.id || 'lead',
              name: lead?.name || 'مدیر دپارتمان',
              roleFa: lead?.roleFa || 'مدیر',
              departmentId: d.id,
              isLead: true,
              avatar: lead?.avatar || '👔',
              model: lead?.model || 'gemini-3.5-flash-lite',
              status: (lead?.status as any) || 'online',
              specialtyFa: lead?.specialtyFa || '',
              systemPrompt: lead?.systemPrompt || '',
            },
            members: regulars.map((m) => ({
              id: m.id,
              name: m.name,
              roleFa: m.roleFa,
              departmentId: d.id,
              isLead: false,
              avatar: m.avatar,
              model: m.model,
              status: m.status as any,
              specialtyFa: m.specialtyFa,
              assignedChannelsFa: m.assignedChannelsFa || undefined,
            })),
          };
        });
      }
    } catch (err) {
      console.error('Database getDepartments error:', err);
    }
  }
  return readJsonFile<Department[]>('departments.json', INITIAL_DEPARTMENTS);
}

export async function saveDepartments(departments: Department[]) {
  writeJsonFile('departments.json', departments);
}

// -------------------------------------------------------------
// Tasks
// -------------------------------------------------------------
export async function getTasks(): Promise<TaskItem[]> {
  if (isDbConnected()) {
    try {
      const dbTasks = await prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return dbTasks.map((t) => ({
        id: t.id,
        titleFa: t.titleFa,
        departmentId: t.departmentId,
        departmentNameFa: t.departmentNameFa,
        assignedAgentName: t.assignedAgentName,
        status: t.status as any,
        priority: t.priority as any,
        dueDateFa: t.dueDateFa,
        notesFa: t.notesFa || undefined,
        contentFa: t.contentFa || undefined,
        imageUrl: t.imageUrl || undefined,
        targetChannels: (t.targetChannels as string[]) || undefined,
        createdAt: t.createdAt.toLocaleDateString('fa-IR'),
      }));
    } catch (err) {
      console.error('Database getTasks error:', err);
    }
  }
  return readJsonFile<TaskItem[]>('tasks.json', INITIAL_TASKS);
}

export async function saveTask(task: TaskItem) {
  if (isDbConnected()) {
    try {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {
          status: task.status,
          priority: task.priority,
          dueDateFa: task.dueDateFa,
          notesFa: task.notesFa,
          contentFa: task.contentFa,
          imageUrl: task.imageUrl,
          targetChannels: task.targetChannels,
        },
        create: {
          id: task.id,
          titleFa: task.titleFa,
          departmentId: task.departmentId,
          departmentNameFa: task.departmentNameFa,
          assignedAgentName: task.assignedAgentName,
          status: task.status,
          priority: task.priority,
          dueDateFa: task.dueDateFa,
          notesFa: task.notesFa,
          contentFa: task.contentFa,
          imageUrl: task.imageUrl,
          targetChannels: task.targetChannels,
        },
      });
      return;
    } catch (err) {
      console.error('Database saveTask error:', err);
    }
  }

  const tasks = readJsonFile<TaskItem[]>('tasks.json', INITIAL_TASKS);
  const index = tasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    tasks[index] = task;
  } else {
    tasks.unshift(task);
  }
  writeJsonFile('tasks.json', tasks);
}

export async function saveTasks(tasks: TaskItem[]) {
  writeJsonFile('tasks.json', tasks);
}

export async function getTasksByTag(tag: string, status?: string): Promise<TaskItem[]> {
  const allTasks = await getTasks();
  const cleanTag = tag.replace(/^#/, '').toLowerCase();
  return allTasks.filter((t) => {
    const matchesTag = t.departmentId.toLowerCase() === cleanTag;
    if (!matchesTag) return false;
    if (status && status !== 'all' && t.status !== status) return false;
    return true;
  });
}

export async function updateTaskStatusInStorage(taskId: string, status: any): Promise<TaskItem | null> {
  const allTasks = await getTasks();
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.status = status;
  await saveTask(task);
  return task;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  if (isDbConnected()) {
    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (task) {
        await prisma.task.delete({ where: { id: taskId } });
        await prisma.department.updateMany({
          where: { id: task.departmentId, activeTasksCount: { gt: 0 } },
          data: { activeTasksCount: { decrement: 1 } },
        });
      }
      return true;
    } catch (err) {
      console.error('Database deleteTask error:', err);
    }
  }

  const tasks = readJsonFile<TaskItem[]>('tasks.json', INITIAL_TASKS);
  const filtered = tasks.filter((t) => t.id !== taskId);
  writeJsonFile('tasks.json', filtered);
  return true;
}

// -------------------------------------------------------------
// Reports
// -------------------------------------------------------------
export async function getReports(): Promise<ExecutiveReport[]> {
  if (isDbConnected()) {
    try {
      const dbReports = await prisma.executiveReport.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return dbReports.map((r) => ({
        id: r.id,
        departmentId: r.departmentId,
        departmentNameFa: r.departmentNameFa,
        periodFa: r.periodFa,
        titleFa: r.titleFa,
        summaryFa: r.summaryFa,
        accomplishments: (r.accomplishments as string[]) || [],
        blockers: (r.blockers as string[]) || [],
        metrics: (r.metrics as any[]) || [],
        createdAt: r.createdAt.toLocaleDateString('fa-IR'),
      }));
    } catch (err) {
      console.error('Database getReports error:', err);
    }
  }
  return readJsonFile<ExecutiveReport[]>('reports.json', INITIAL_REPORTS);
}

export async function saveReports(reports: ExecutiveReport[]) {
  writeJsonFile('reports.json', reports);
}

// -------------------------------------------------------------
// Escalations
// -------------------------------------------------------------
export async function getEscalations(): Promise<EscalationMessage[]> {
  if (isDbConnected()) {
    try {
      const alerts = await prisma.escalationAlert.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return alerts.map((a) => ({
        id: a.id,
        departmentId: a.departmentId,
        departmentNameFa: a.departmentId === 'social' ? 'شبکه‌های اجتماعی' : 'سئو',
        senderAgentName: a.senderAgentName,
        senderRoleFa: a.senderRoleFa,
        messageFa: a.messageFa,
        urgency: a.urgency as any,
        status: a.status as any,
        timestamp: a.createdAt.toLocaleTimeString('fa-IR'),
      }));
    } catch (err) {
      console.error('Database getEscalations error:', err);
    }
  }
  return readJsonFile<EscalationMessage[]>('escalations.json', INITIAL_ESCALATIONS);
}

export async function saveEscalations(escalations: EscalationMessage[]) {
  writeJsonFile('escalations.json', escalations);
}

// -------------------------------------------------------------
// 1-on-1 Chat History
// -------------------------------------------------------------
export async function getChatHistory(deptId: string): Promise<ChatMessage[]> {
  if (isDbConnected()) {
    try {
      const msgs = await prisma.meetingMessage.findMany({
        where: { departmentId: deptId },
        orderBy: { createdAt: 'asc' },
      });
      return msgs.map((m) => ({
        id: m.id,
        departmentId: m.departmentId,
        sender: m.sender as any,
        senderName: m.senderName,
        text: m.text,
        timestamp: m.createdAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        actionsTaken: (m.actionsTaken as string[]) || undefined,
      }));
    } catch (err) {
      console.error('Database getChatHistory error:', err);
    }
  }

  const allChats = readJsonFile<Record<string, ChatMessage[]>>(
    'chats.json',
    INITIAL_CHAT_HISTORY
  );
  return allChats[deptId] || [];
}

export async function addChatMessage(deptId: string, message: ChatMessage) {
  if (isDbConnected()) {
    try {
      await prisma.meetingMessage.create({
        data: {
          id: message.id,
          departmentId: deptId,
          sender: message.sender,
          senderName: message.senderName,
          text: message.text,
          actionsTaken: message.actionsTaken || undefined,
        },
      });
      return;
    } catch (err) {
      console.error('Database addChatMessage error:', err);
    }
  }

  const allChats = readJsonFile<Record<string, ChatMessage[]>>(
    'chats.json',
    INITIAL_CHAT_HISTORY
  );
  if (!allChats[deptId]) {
    allChats[deptId] = [];
  }
  allChats[deptId].push(message);
  writeJsonFile('chats.json', allChats);
}

export async function clearChatHistory(deptId?: string): Promise<boolean> {
  if (isDbConnected()) {
    try {
      if (deptId) {
        await prisma.meetingMessage.deleteMany({
          where: { departmentId: deptId },
        });
      } else {
        await prisma.meetingMessage.deleteMany({});
      }
    } catch (err) {
      console.error('Database clearChatHistory error:', err);
    }
  }

  const allChats = readJsonFile<Record<string, ChatMessage[]>>(
    'chats.json',
    INITIAL_CHAT_HISTORY
  );
  if (deptId) {
    allChats[deptId] = [];
  } else {
    for (const key of Object.keys(allChats)) {
      allChats[key] = [];
    }
  }
  writeJsonFile('chats.json', allChats);
  return true;
}

// -------------------------------------------------------------
// Boardroom Sessions
// -------------------------------------------------------------
export async function getBoardroomSessions(): Promise<BoardroomSession[]> {
  if (isDbConnected()) {
    try {
      const records = await prisma.boardroomSessionRecord.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return records.map((r) => ({
        id: r.id,
        topicFa: r.topicFa,
        activeDepartmentIds: r.activeDepartmentIds as string[],
        messages: r.dialogue as any,
        actionItems: r.actionItems as any,
        createdAt: r.createdAt.toLocaleDateString('fa-IR'),
      }));
    } catch (err) {
      console.error('Database getBoardroomSessions error:', err);
    }
  }
  return readJsonFile<BoardroomSession[]>('boardroom.json', []);
}

export async function saveBoardroomSession(session: BoardroomSession) {
  if (isDbConnected()) {
    try {
      await prisma.boardroomSessionRecord.create({
        data: {
          id: session.id,
          topicFa: session.topicFa,
          activeDepartmentIds: session.activeDepartmentIds,
          dialogue: session.messages as any,
          actionItems: session.actionItems as any,
        },
      });
      return;
    } catch (err) {
      console.error('Database saveBoardroomSession error:', err);
    }
  }

  const sessions = await getBoardroomSessions();
  sessions.unshift(session);
  writeJsonFile('boardroom.json', sessions);
}
export async function getDepartmentKnowledge(deptId: string): Promise<string> {
  const parts: string[] = [];

  if (isDbConnected()) {
    try {
      // 1. Fetch Strategies
      const strategies = await prisma.strategy.findMany({
        where: { departmentId: deptId },
        orderBy: { createdAt: 'desc' },
      });
      if (strategies.length > 0) {
        parts.push('📋 استراتژی‌ها و اهداف ثبت‌شده در دیتابیس گلینو:');
        for (const s of strategies) {
          parts.push(`- [افق زمانی: ${s.horizon}] عنوان: ${s.titleFa} | توضیحات: ${s.descriptionFa} (وضعیت: ${s.status})`);
        }
      }

      // 2. Fetch Tasks
      const tasks = await prisma.task.findMany({
        where: { departmentId: deptId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      if (tasks.length > 0) {
        parts.push('\n📝 تسک‌ها و برنامه‌های اخیر ثبت‌شده:');
        for (const t of tasks) {
          parts.push(`- ${t.titleFa} [مسئول: ${t.assignedAgentName} | وضعیت: ${t.status}] ${t.notesFa ? `نکات: ${t.notesFa}` : ''}`);
        }
      }

      // 3. Fetch Reports
      const reports = await prisma.executiveReport.findMany({
        where: { departmentId: deptId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });
      if (reports.length > 0) {
        parts.push('\n📊 گزارش‌های عملکرد دوره‌ای ثبت‌شده:');
        for (const r of reports) {
          parts.push(`- گزارش: ${r.titleFa} (${r.periodFa}): ${r.summaryFa}`);
        }
      }
    } catch (err) {
      console.error('Error fetching department knowledge from DB:', err);
    }
  }

  // Also check tasks in fallback JSON if DB empty
  if (parts.length === 0) {
    const fallbackTasks = readJsonFile<TaskItem[]>('tasks.json', INITIAL_TASKS).filter(
      (t) => t.departmentId === deptId
    );
    if (fallbackTasks.length > 0) {
      parts.push('📝 تسک‌های ثبت‌شده در سامانه:');
      for (const t of fallbackTasks) {
        parts.push(`- ${t.titleFa} (وضعیت: ${t.status})`);
      }
    }
  }

  // 4. Inject Department Schedules (برنامه‌ها و زمان‌بندی‌های مدیر)
  const schedules = await getSchedules(deptId);
  if (schedules.length > 0) {
    parts.push('\n🗓️ برنامه‌ها و زمان‌بندی‌های در حال اجرا یا ثبت‌شده:');
    for (const s of schedules) {
      parts.push(`\n- برنامه: «${s.titleFa}» (پیشرفت: ${s.progressPercent}٪ | بازه: ${s.startDateFa} تا ${s.targetDateFa})`);
      for (const st of s.steps) {
        const statusText =
          st.status === 'completed'
            ? `انجام‌شده در ${st.completedDateFa || 'تاریخ نامشخص'}`
            : `موعد انجام: ${st.targetDateFa}`;
        parts.push(`  • گام ${st.stepNumber}: ${st.titleFa} [مسئول: ${st.assignedTo}] (${statusText})`);
      }
    }
  }

  return parts.join('\n');
}

// -------------------------------------------------------------
// Department Multi-Step Schedules
// -------------------------------------------------------------
export async function getSchedules(departmentId?: string): Promise<DepartmentSchedule[]> {
  // Always check DB first if table exists
  if (isDbConnected()) {
    try {
      // If table exists in Prisma
      if ((prisma as any).departmentSchedule) {
        const dbSchedules = await (prisma as any).departmentSchedule.findMany({
          where: departmentId ? { departmentId } : undefined,
          orderBy: { createdAt: 'desc' },
        });
        if (dbSchedules && dbSchedules.length > 0) {
          return dbSchedules.map((s: any) => ({
            id: s.id,
            departmentId: s.departmentId,
            departmentNameFa: s.departmentNameFa,
            creatorAgentName: s.creatorAgentName,
            creatorRoleFa: s.creatorRoleFa || undefined,
            creatorAvatar: s.creatorAvatar || undefined,
            titleFa: s.titleFa,
            descriptionFa: s.descriptionFa,
            startDateFa: s.startDateFa,
            targetDateFa: s.targetDateFa,
            status: s.status,
            progressPercent: s.progressPercent,
            steps: typeof s.steps === 'string' ? JSON.parse(s.steps) : s.steps,
            createdAtFa: s.createdAt.toLocaleDateString('fa-IR'),
            updatedAtFa: s.updatedAt ? s.updatedAt.toLocaleDateString('fa-IR') : undefined,
          }));
        }
      }
    } catch (err) {
      // Table might not exist yet before db push, seamlessly fall back to JSON
      console.warn('Database getSchedules notice (falling back to JSON store):', err);
    }
  }

  const all = readJsonFile<DepartmentSchedule[]>('schedules.json', INITIAL_SCHEDULES);
  if (departmentId) {
    return all.filter((s) => s.departmentId === departmentId);
  }
  return all;
}

export async function saveSchedule(schedule: DepartmentSchedule): Promise<void> {
  const all = await getSchedules();
  const index = all.findIndex((s) => s.id === schedule.id);

  // Re-calculate progressPercent strictly based on steps
  if (schedule.steps && schedule.steps.length > 0) {
    const completedCount = schedule.steps.filter((s) => s.status === 'completed').length;
    schedule.progressPercent = Math.round((completedCount / schedule.steps.length) * 100);
    if (schedule.progressPercent === 100) {
      schedule.status = 'completed';
    } else if (schedule.status === 'completed' && schedule.progressPercent < 100) {
      schedule.status = 'in_progress';
    }
  }

  if (index >= 0) {
    all[index] = { ...all[index], ...schedule, updatedAtFa: getTodayPersianDate() };
  } else {
    all.unshift({
      ...schedule,
      createdAtFa: schedule.createdAtFa || getTodayPersianDate(),
      updatedAtFa: getTodayPersianDate(),
    });
  }

  writeJsonFile('schedules.json', all);

  if (isDbConnected() && (prisma as any).departmentSchedule) {
    try {
      await (prisma as any).departmentSchedule.upsert({
        where: { id: schedule.id },
        update: {
          titleFa: schedule.titleFa,
          descriptionFa: schedule.descriptionFa,
          startDateFa: schedule.startDateFa,
          targetDateFa: schedule.targetDateFa,
          status: schedule.status,
          progressPercent: schedule.progressPercent,
          steps: schedule.steps,
        },
        create: {
          id: schedule.id,
          departmentId: schedule.departmentId,
          departmentNameFa: schedule.departmentNameFa,
          creatorAgentName: schedule.creatorAgentName,
          titleFa: schedule.titleFa,
          descriptionFa: schedule.descriptionFa,
          startDateFa: schedule.startDateFa,
          targetDateFa: schedule.targetDateFa,
          status: schedule.status,
          progressPercent: schedule.progressPercent,
          steps: schedule.steps,
        },
      });
    } catch (err) {
      console.warn('Database saveSchedule notice:', err);
    }
  }
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const all = await getSchedules();
  const filtered = all.filter((s) => s.id !== id);
  writeJsonFile('schedules.json', filtered);

  if (isDbConnected() && (prisma as any).departmentSchedule) {
    try {
      await (prisma as any).departmentSchedule.delete({
        where: { id },
      });
    } catch {
      // Ignore
    }
  }
  return true;
}

export async function toggleScheduleStepStatus(
  scheduleId: string,
  stepId: string
): Promise<DepartmentSchedule | null> {
  const all = await getSchedules();
  const schedule = all.find((s) => s.id === scheduleId);
  if (!schedule) return null;

  const step = schedule.steps.find((st) => st.id === stepId);
  if (!step) return null;

  if (step.status === 'completed') {
    step.status = 'in_progress';
    step.completedDateFa = undefined;
  } else {
    step.status = 'completed';
    step.completedDateFa = getTodayPersianDate();
  }

  // Recalculate progress
  const completedCount = schedule.steps.filter((s) => s.status === 'completed').length;
  schedule.progressPercent = Math.round((completedCount / schedule.steps.length) * 100);
  if (schedule.progressPercent === 100) {
    schedule.status = 'completed';
  } else {
    schedule.status = 'in_progress';
  }
  schedule.updatedAtFa = getTodayPersianDate();

  writeJsonFile('schedules.json', all);

  if (isDbConnected() && (prisma as any).departmentSchedule) {
    try {
      await (prisma as any).departmentSchedule.update({
        where: { id: scheduleId },
        data: {
          progressPercent: schedule.progressPercent,
          status: schedule.status,
          steps: schedule.steps,
        },
      });
    } catch {
      // Ignore
    }
  }

  return schedule;
}
