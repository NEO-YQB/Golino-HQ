import { NextResponse } from 'next/server';
import {
  getDepartments,
  saveDepartments,
  getChatHistory,
  addChatMessage,
  saveTask,
  getDepartmentKnowledge,
  clearChatHistory,
} from '@/lib/storage';
import { askDepartmentLead } from '@/lib/ai';
import { ChatMessage } from '@/types';

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

    // 1. Fetch previous history BEFORE adding this prompt
    const previousHistory = await getChatHistory(deptId);

    // 2. Query Lead Agent with Tool Calling / MCP (Slim context, dynamic tools)
    const { replyText, newTask, actionsTaken } = await askDepartmentLead(
      department,
      previousHistory,
      text
    );

    // 3. Save Afshin's message
    const ceoMsg: ChatMessage = {
      id: `ceo-${Date.now()}`,
      departmentId: deptId,
      sender: 'ceo',
      senderName: 'افشین (مدیرعامل)',
      text,
      timestamp: 'همین الان',
    };
    await addChatMessage(deptId, ceoMsg);

    // 4. If a task was created via MCP tool, update activeTasksCount
    if (newTask) {
      department.activeTasksCount += 1;
      await saveDepartments(departments);
    }

    // 5. Save Lead Response (including real-time actions taken)
    const leadMsg: ChatMessage = {
      id: `lead-${Date.now()}`,
      departmentId: deptId,
      sender: 'lead',
      senderName: `${department.leadAgent.name} (${department.leadAgent.roleFa})`,
      text: replyText,
      timestamp: 'همین الان',
      actionsTaken: actionsTaken && actionsTaken.length > 0 ? actionsTaken : undefined,
    };
    await addChatMessage(deptId, leadMsg);

    return NextResponse.json({
      ceoMessage: ceoMsg,
      leadMessage: leadMsg,
      taskCreated: !!newTask,
      actionsTaken: actionsTaken || [],
    });
  } catch (err) {
    console.error('Meeting API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get('deptId') || undefined;
    await clearChatHistory(deptId);
    return NextResponse.json({ success: true, cleared: true });
  } catch (err) {
    console.error('Clear chat API error:', err);
    return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 });
  }
}
