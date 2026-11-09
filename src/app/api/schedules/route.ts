import { NextResponse } from 'next/server';
import { getSchedules, saveSchedule, deleteSchedule } from '@/lib/storage';
import { DepartmentSchedule } from '@/types';
import { getTodayPersianDate } from '@/lib/persianDate';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get('deptId') || undefined;
    const schedules = await getSchedules(deptId);
    return NextResponse.json(schedules);
  } catch (err: any) {
    console.error('Error fetching schedules:', err);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.titleFa || !body.departmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSchedule: DepartmentSchedule = {
      id: body.id || `sched-${Date.now()}`,
      departmentId: body.departmentId,
      departmentNameFa: body.departmentNameFa || 'عمومی',
      creatorAgentName: body.creatorAgentName || 'مدیر دپارتمان',
      creatorRoleFa: body.creatorRoleFa,
      creatorAvatar: body.creatorAvatar || '📋',
      titleFa: body.titleFa,
      descriptionFa: body.descriptionFa || '',
      startDateFa: body.startDateFa || getTodayPersianDate(),
      targetDateFa: body.targetDateFa || getTodayPersianDate(),
      status: body.status || 'in_progress',
      progressPercent: typeof body.progressPercent === 'number' ? body.progressPercent : 0,
      steps: Array.isArray(body.steps) ? body.steps : [],
      createdAtFa: body.createdAtFa || getTodayPersianDate(),
      updatedAtFa: getTodayPersianDate(),
    };

    await saveSchedule(newSchedule);
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (err: any) {
    console.error('Error saving schedule:', err);
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing schedule id' }, { status: 400 });
    }

    await deleteSchedule(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting schedule:', err);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
