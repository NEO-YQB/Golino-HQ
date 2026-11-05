import { NextResponse } from 'next/server';
import { getTasks, saveTask } from '@/lib/storage';

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  try {
    const { taskId, newStatus } = await req.json();
    const tasks = await getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    task.status = newStatus;
    await saveTask(task);
    return NextResponse.json({ success: true, task });
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
