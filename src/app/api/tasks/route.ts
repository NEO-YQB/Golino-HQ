import { NextResponse } from 'next/server';
import { getTasks, saveTasks } from '@/lib/storage';

export async function GET() {
  const tasks = getTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  try {
    const { taskId, newStatus } = await req.json();
    const tasks = getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    task.status = newStatus;
    saveTasks(tasks);
    return NextResponse.json({ success: true, task });
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
