import { NextRequest, NextResponse } from 'next/server';
import { 
  checkRateLimit, 
  resetRateLimit, 
  verifyAdminPassword, 
  createSignedToken, 
  SESSION_COOKIE_NAME 
} from '@/lib/serverAuth';

export async function POST(req: NextRequest) {
  try {
    // 1. IP determination for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('x-real-ip') || 
               'unknown-client';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          code: 'RATE_LIMITED',
          message: `هەوڵی زۆر دراوە! تکایە ${rateCheck.retryAfter} چرکە چاوەڕێ بکە پێش ئەوەی دووبارە هەوڵ بدەیتەوە.` 
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password, customPinHash, remember = true } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'تکایە وشەی نهێنی بنووسە!' },
        { status: 400 }
      );
    }

    // 2. Server-side password verification
    const isValid = verifyAdminPassword(password, customPinHash);

    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          code: 'INVALID_CREDENTIALS',
          message: 'وشەی نهێنی هەڵەیە! تکایە وشەی ڕاست بنووسە.',
          remainingAttempts: rateCheck.remaining
        },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    resetRateLimit(ip);

    // 3. Issue cryptographically signed session token
    const durationDays = remember ? 7 : 1;
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const token = createSignedToken({ role: 'admin', expiresAt });

    // 4. Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      token,
      expiresAt,
      user: { role: 'admin' },
      message: 'چوونەژوورەوە وەک سەرپەرشتیار بە سەرکەوتوویی ئەنجامدرا.'
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: durationDays * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Server login error:', err);
    return NextResponse.json(
      { success: false, message: 'هەڵەی ناوخۆیی ڕوویدا لە کاتی چوونەژوورەوە.' },
      { status: 500 }
    );
  }
}
