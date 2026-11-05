import { NextResponse } from 'next/server';
import { getEscalations, saveEscalations } from '@/lib/storage';

export async function GET() {
  const escalations = await getEscalations();
  return NextResponse.json(escalations);
}

export async function POST(req: Request) {
  try {
    const { id, newStatus } = await req.json();
    const list = await getEscalations();
    const item = list.find((e) => e.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    item.status = newStatus;
    await saveEscalations(list);
    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
