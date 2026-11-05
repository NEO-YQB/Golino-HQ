import { NextResponse } from 'next/server';
import {
  getDepartments,
  saveDepartments,
  getChatHistory,
  addChatMessage,
  saveTask,
  getDepartmentKnowledge,
} from '@/lib/storage';
import { askDepartmentLead } from '@/lib/ai';
import { ChatMessage, TaskItem } from '@/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deptId = searchParams.get('deptId') || 'social';
  const history = await getChatHistory(deptId);
  return NextResponse.json(history);
}

export async function POST(req: Request) {
  try {
    const { deptId, text } = await req.json();
    if (!deptId || !text) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const departments = await getDepartments();
    const department = departments.find((d) => d.id === deptId);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // 1. Fetch previous history BEFORE adding this new prompt (prevents duplicate user messages!)
    const previousHistory = await getChatHistory(deptId);

    // 2. Fetch all real data, strategies, and tasks entered into the database for this department
    const deptKnowledge = await getDepartmentKnowledge(deptId);

    // 3. Query Lead Agent with clean history and real database knowledge
    const { replyText, actionsTaken, newTask } = await askDepartmentLead(
      department,
      previousHistory,
      text,
      deptKnowledge
    );

    // 4. Save Afshin's message
    const ceoMsg: ChatMessage = {
      id: `ceo-${Date.now()}`,
      departmentId: deptId,
      sender: 'ceo',
      senderName: 'افشین (مدیرعامل)',
      text,
      timestamp: 'همین الان',
    };
    await addChatMessage(deptId, ceoMsg);

    // 5. If a concrete task was agreed upon, save it
    let createdTaskInfo: ChatMessage['createdTask'] = undefined;
    if (newTask) {
      const taskItem: TaskItem = {
        id: `task-${Date.now()}`,
        titleFa: newTask.titleFa,
        departmentId: deptId,
        departmentNameFa: department.nameFa,
        assignedAgentName: newTask.assignedAgentName,
        status: 'awaiting_approval',
        priority: 'high',
        createdAt: 'امروز',
        dueDateFa: 'امروز / فردا',
        notesFa: `به پیشنهاد ${department.leadAgent.name} در گفتگو با افشین`,
        contentFa: newTask.contentFa,
        imageUrl: newTask.imageUrl,
        targetChannels: newTask.targetChannels || ['تلگرام', 'بله', 'اینستاگرام'],
      };

      await saveTask(taskItem);

      // Increment active tasks count
      department.activeTasksCount += 1;
      await saveDepartments(departments);

      createdTaskInfo = {
        title: taskItem.titleFa,
        assignedTo: taskItem.assignedAgentName,
        previewText: taskItem.contentFa?.slice(0, 100),
      };
    }

    // 6. Save Lead Response
    const leadMsg: ChatMessage = {
      id: `lead-${Date.now()}`,
      departmentId: deptId,
      sender: 'lead',
      senderName: `${department.leadAgent.name} (${department.leadAgent.roleFa})`,
      text: replyText,
      timestamp: 'همین الان',
      actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
      createdTask: createdTaskInfo,
    };
    await addChatMessage(deptId, leadMsg);

    return NextResponse.json({
      ceoMessage: ceoMsg,
      leadMessage: leadMsg,
      taskCreated: !!newTask,
    });
  } catch (err) {
    console.error('Meeting API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
