import { NextResponse } from 'next/server';
import { getDepartments, saveDepartments } from '@/lib/storage';

export async function GET() {
  const departments = getDepartments();
  return NextResponse.json(departments);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const departments = getDepartments();
    departments.push(body);
    saveDepartments(departments);
    return NextResponse.json({ success: true, departments });
  } catch {
    return NextResponse.json({ error: 'Failed to save department' }, { status: 500 });
  }
}
