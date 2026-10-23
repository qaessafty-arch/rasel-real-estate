import { NextRequest, NextResponse } from 'next/server';
import { verifySessionRequest } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const session = verifySessionRequest(req);
  return NextResponse.json({
    authenticated: session.authenticated,
    role: session.role || null,
    user: session.user || null
  });
}
