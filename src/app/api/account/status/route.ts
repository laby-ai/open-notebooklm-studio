import { NextResponse } from 'next/server';
import { getAccountCenterStatus } from '@/lib/account-center';

export async function GET() {
  return NextResponse.json(getAccountCenterStatus(), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
