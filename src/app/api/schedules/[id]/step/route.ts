import { NextResponse } from 'next/server';
import { toggleScheduleStepStatus } from '@/lib/storage';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { stepId } = await req.json();
    if (!stepId) {
      return NextResponse.json({ error: 'Missing stepId' }, { status: 400 });
    }

    const updated = await toggleScheduleStepStatus(params.id, stepId);
    if (!updated) {
      return NextResponse.json({ error: 'Schedule or step not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error toggling step status:', err);
    return NextResponse.json({ error: 'Failed to update step' }, { status: 500 });
  }
}
