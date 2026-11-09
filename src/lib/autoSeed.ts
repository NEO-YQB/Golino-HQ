import { prisma, isDbConnected } from './prisma';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_TASKS,
  INITIAL_REPORTS,
  INITIAL_CHAT_HISTORY,
} from './data';

export async function ensureTablesAndSeed(): Promise<{
  success: boolean;
  message: string;
  counts?: { departments: number; agents: number; tasks: number; reports: number };
}> {
  if (!isDbConnected()) {
    return {
      success: false,
      message: 'DATABASE_URL is not configured or Prisma is not connected.',
    };
  }

  try {
    // 1. Ensure all tables exist (Self-healing schema, executed individually to prevent multi-statement prepared statement errors)
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "nameFa" TEXT NOT NULL,
        "descriptionFa" TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#D3A74B',
        status TEXT NOT NULL DEFAULT 'active',
        "activeTasksCount" INTEGER NOT NULL DEFAULT 0,
        "errorCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "roleFa" TEXT NOT NULL,
        "departmentId" TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        "isLead" BOOLEAN NOT NULL DEFAULT false,
        avatar TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT 'gemini-3.5-flash-lite',
        status TEXT NOT NULL DEFAULT 'online',
        "specialtyFa" TEXT NOT NULL,
        "assignedChannelsFa" TEXT,
        "systemPrompt" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        "titleFa" TEXT NOT NULL,
        "departmentId" TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        "departmentNameFa" TEXT NOT NULL,
        "assignedAgentName" TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        "dueDateFa" TEXT NOT NULL,
        "notesFa" TEXT,
        "contentFa" TEXT,
        "imageUrl" TEXT,
        "targetChannels" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS executive_reports (
        id TEXT PRIMARY KEY,
        "departmentId" TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        "departmentNameFa" TEXT NOT NULL,
        "periodFa" TEXT NOT NULL,
        "titleFa" TEXT NOT NULL,
        "summaryFa" TEXT NOT NULL,
        accomplishments JSONB,
        blockers JSONB,
        metrics JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS meeting_messages (
        id TEXT PRIMARY KEY,
        "departmentId" TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        text TEXT NOT NULL,
        "actionsTaken" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS escalation_alerts (
        id TEXT PRIMARY KEY,
        "departmentId" TEXT NOT NULL,
        "senderAgentName" TEXT NOT NULL,
        "senderRoleFa" TEXT NOT NULL,
        "messageFa" TEXT NOT NULL,
        urgency TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'unresolved',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS strategies (
        id TEXT PRIMARY KEY,
        "departmentId" TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        "titleFa" TEXT NOT NULL,
        horizon TEXT NOT NULL DEFAULT 'mid_term',
        "descriptionFa" TEXT NOT NULL,
        kpis JSONB,
        status TEXT NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS content_calendar (
        id TEXT PRIMARY KEY,
        "departmentId" TEXT NOT NULL DEFAULT 'social' REFERENCES departments(id) ON DELETE CASCADE,
        "scheduledAt" TIMESTAMP(3) NOT NULL,
        channel TEXT NOT NULL,
        "titleFa" TEXT NOT NULL,
        "captionFa" TEXT NOT NULL,
        "mediaUrl" TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled',
        "publishedAt" TIMESTAMP(3),
        "postUrl" TEXT,
        "failureReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of tableQueries) {
      await prisma.$executeRawUnsafe(query);
    }

    // 2. Seed / Upsert Departments & Agents
    let agentCount = 0;
    for (const dept of INITIAL_DEPARTMENTS) {
      await prisma.department.upsert({
        where: { id: dept.id },
        update: {
          name: dept.name,
          nameFa: dept.nameFa,
          descriptionFa: dept.descriptionFa,
          icon: dept.icon,
          color: dept.color,
          status: dept.status,
          activeTasksCount: dept.activeTasksCount,
        },
        create: {
          id: dept.id,
          name: dept.name,
          nameFa: dept.nameFa,
          descriptionFa: dept.descriptionFa,
          icon: dept.icon,
          color: dept.color,
          status: dept.status,
          activeTasksCount: dept.activeTasksCount,
          errorCount: 0,
        },
      });

      // Lead agent
      const lead = dept.leadAgent;
      await prisma.agent.upsert({
        where: { id: lead.id },
        update: {
          name: lead.name,
          roleFa: lead.roleFa,
          departmentId: dept.id,
          isLead: true,
          avatar: lead.avatar,
          model: lead.model,
          status: lead.status,
          specialtyFa: lead.specialtyFa,
          systemPrompt: lead.systemPrompt,
        },
        create: {
          id: lead.id,
          name: lead.name,
          roleFa: lead.roleFa,
          departmentId: dept.id,
          isLead: true,
          avatar: lead.avatar,
          model: lead.model,
          status: lead.status,
          specialtyFa: lead.specialtyFa,
          systemPrompt: lead.systemPrompt,
        },
      });
      agentCount++;

      // Regular members
      for (const m of dept.members) {
        await prisma.agent.upsert({
          where: { id: m.id },
          update: {
            name: m.name,
            roleFa: m.roleFa,
            departmentId: dept.id,
            isLead: false,
            avatar: m.avatar,
            model: m.model,
            status: m.status,
            specialtyFa: m.specialtyFa,
            assignedChannelsFa: m.assignedChannelsFa || null,
          },
          create: {
            id: m.id,
            name: m.name,
            roleFa: m.roleFa,
            departmentId: dept.id,
            isLead: false,
            avatar: m.avatar,
            model: m.model,
            status: m.status,
            specialtyFa: m.specialtyFa,
            assignedChannelsFa: m.assignedChannelsFa || null,
          },
        });
        agentCount++;
      }
    }

    // 3. Seed / Upsert Tasks
    for (const t of INITIAL_TASKS) {
      await prisma.task.upsert({
        where: { id: t.id },
        update: {
          titleFa: t.titleFa,
          departmentId: t.departmentId,
          departmentNameFa: t.departmentNameFa,
          assignedAgentName: t.assignedAgentName,
          status: t.status,
          priority: t.priority,
          dueDateFa: t.dueDateFa,
          notesFa: t.notesFa,
          contentFa: t.contentFa,
          imageUrl: t.imageUrl,
          targetChannels: t.targetChannels as any,
        },
        create: {
          id: t.id,
          titleFa: t.titleFa,
          departmentId: t.departmentId,
          departmentNameFa: t.departmentNameFa,
          assignedAgentName: t.assignedAgentName,
          status: t.status,
          priority: t.priority,
          dueDateFa: t.dueDateFa,
          notesFa: t.notesFa,
          contentFa: t.contentFa,
          imageUrl: t.imageUrl,
          targetChannels: t.targetChannels as any,
        },
      });
    }

    // 4. Seed / Upsert Reports
    for (const r of INITIAL_REPORTS) {
      await prisma.executiveReport.upsert({
        where: { id: r.id },
        update: {
          departmentId: r.departmentId,
          departmentNameFa: r.departmentNameFa,
          periodFa: r.periodFa,
          titleFa: r.titleFa,
          summaryFa: r.summaryFa,
          accomplishments: r.accomplishments as any,
          blockers: r.blockers as any,
          metrics: r.metrics as any,
        },
        create: {
          id: r.id,
          departmentId: r.departmentId,
          departmentNameFa: r.departmentNameFa,
          periodFa: r.periodFa,
          titleFa: r.titleFa,
          summaryFa: r.summaryFa,
          accomplishments: r.accomplishments as any,
          blockers: r.blockers as any,
          metrics: r.metrics as any,
        },
      });
    }

    // 5. Seed Initial Chat Messages if empty
    for (const [deptId, msgs] of Object.entries(INITIAL_CHAT_HISTORY)) {
      const existing = await prisma.meetingMessage.count({ where: { departmentId: deptId } });
      if (existing === 0) {
        for (const m of msgs) {
          await prisma.meetingMessage.create({
            data: {
              id: m.id,
              departmentId: deptId,
              sender: m.sender,
              senderName: m.senderName,
              text: m.text,
              actionsTaken: m.actionsTaken as any,
            },
          });
        }
      }
    }

    return {
      success: true,
      message: 'Golino HQ Database successfully initialized and seeded!',
      counts: {
        departments: INITIAL_DEPARTMENTS.length,
        agents: agentCount,
        tasks: INITIAL_TASKS.length,
        reports: INITIAL_REPORTS.length,
      },
    };
  } catch (err: any) {
    console.error('Error in ensureTablesAndSeed:', err);
    return {
      success: false,
      message: `Database seed failed: ${err.message || String(err)}`,
    };
  }
}
