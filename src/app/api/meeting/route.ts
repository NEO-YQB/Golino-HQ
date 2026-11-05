import { NextResponse } from 'next/server';
import {
  getDepartments,
  saveDepartments,
  getChatHistory,
  addChatMessage,
  saveTask,
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

    // 1. Save CEO Message
    const ceoMsg: ChatMessage = {
      id: `ceo-${Date.now()}`,
      departmentId: deptId,
      sender: 'ceo',
      senderName: 'مدیرعامل گلینو',
      text,
      timestamp: 'همین الان',
    };
    await addChatMessage(deptId, ceoMsg);

    // 2. Query Lead Agent
    const history = await getChatHistory(deptId);
    const { replyText, actionsTaken, newTask } = await askDepartmentLead(department, history, text);

    // 3. If a task was formulated, save it to the Task Queue!
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
        notesFa: `ایجاد شده در جلسه کاری مدیرعامل با ${department.leadAgent.name}`,
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

    // 4. Save Lead Response
    const leadMsg: ChatMessage = {
      id: `lead-${Date.now()}`,
      departmentId: deptId,
      sender: 'lead',
      senderName: `${department.leadAgent.name} (${department.leadAgent.roleFa})`,
      text: replyText,
      timestamp: 'همین الان',
      actionsTaken,
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
