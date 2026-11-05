import { NextResponse } from 'next/server';
import { getDepartments, getChatHistory, addChatMessage } from '@/lib/storage';
import { askDepartmentLead } from '@/lib/ai';
import { ChatMessage } from '@/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deptId = searchParams.get('deptId') || 'seo';
  const history = getChatHistory(deptId);
  return NextResponse.json(history);
}

export async function POST(req: Request) {
  try {
    const { deptId, text } = await req.json();
    if (!deptId || !text) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const departments = getDepartments();
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
    addChatMessage(deptId, ceoMsg);

    // 2. Query Lead Agent
    const history = getChatHistory(deptId);
    const { replyText, actionsTaken } = await askDepartmentLead(department, history, text);

    // 3. Save Lead Response
    const leadMsg: ChatMessage = {
      id: `lead-${Date.now()}`,
      departmentId: deptId,
      sender: 'lead',
      senderName: `${department.leadAgent.name} (${department.leadAgent.roleFa})`,
      text: replyText,
      timestamp: 'همین الان',
      actionsTaken,
    };
    addChatMessage(deptId, leadMsg);

    return NextResponse.json({
      ceoMessage: ceoMsg,
      leadMessage: leadMsg,
    });
  } catch (err) {
    console.error('Meeting API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
