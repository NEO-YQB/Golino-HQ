import { NextResponse } from 'next/server';
import { getTasks, saveTask, deleteTask } from '@/lib/storage';

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  try {
    const { taskId, newStatus, action } = await req.json();

    if (action === 'delete' || newStatus === 'deleted') {
      await deleteTask(taskId);
      return NextResponse.json({ success: true, deleted: true });
    }

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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }
    await deleteTask(taskId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
