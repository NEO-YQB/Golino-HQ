import { NextResponse } from 'next/server';
import { getReports } from '@/lib/storage';

export async function GET() {
  const reports = await getReports();
  return NextResponse.json(reports);
}
