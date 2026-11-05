import { NextResponse } from 'next/server';
import { getBoardroomSessions, saveBoardroomSession, getDepartments, getTasks, saveTasks } from '@/lib/storage';
import { runBoardroomSimulation } from '@/lib/ai';
import { BoardroomSession, TaskItem } from '@/types';

export async function GET() {
  const sessions = getBoardroomSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  try {
    const { topicFa, departmentIds } = await req.json();
    if (!topicFa || !departmentIds || !Array.isArray(departmentIds) || departmentIds.length === 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const allDepartments = getDepartments();
    const selectedDepartments = allDepartments.filter((d) => departmentIds.includes(d.id));

    // Run AI Boardroom simulation
    const { messages, actionItems } = await runBoardroomSimulation(topicFa, selectedDepartments);

    const newSession: BoardroomSession = {
      id: `session-${Date.now()}`,
      topicFa,
      activeDepartmentIds: departmentIds,
      messages,
      actionItems,
      createdAt: 'امروز',
    };

    saveBoardroomSession(newSession);

    // Also auto-create corresponding tasks in the global task queue!
    const existingTasks = getTasks();
    for (const item of actionItems) {
      const task: TaskItem = {
        id: `task-br-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        titleFa: item.taskFa,
        departmentId: item.assignedDeptId,
        departmentNameFa: item.assignedDeptNameFa,
        assignedAgentName: 'مصوبه جلسه هیئت‌مدیره',
        status: 'in_progress',
        priority: 'high',
        createdAt: 'امروز',
        dueDateFa: 'ظرف ۴۸ ساعت',
        notesFa: `ایجاد شده از طریق جلسه گروهی با موضوع: ${topicFa}`,
      };
      existingTasks.unshift(task);
    }
    saveTasks(existingTasks);

    return NextResponse.json(newSession);
  } catch (err) {
    console.error('Boardroom API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
