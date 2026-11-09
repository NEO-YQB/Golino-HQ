import { NextResponse } from 'next/server';
import { ensureTablesAndSeed } from '@/lib/autoSeed';

export async function GET() {
  const result = await ensureTablesAndSeed();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST() {
  const result = await ensureTablesAndSeed();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
