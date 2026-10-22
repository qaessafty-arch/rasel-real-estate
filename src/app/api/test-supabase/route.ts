import { NextRequest, NextResponse } from 'next/server';
import { normalizeSupabaseUrl, normalizeSupabaseKey } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { url, key } = await req.json();

    if (!url || !key) {
      return NextResponse.json(
        { success: false, message: 'URL و Anon Key داواکراون!' },
        { status: 400 }
      );
    }

    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = normalizeSupabaseKey(key);

    // Attempt backend fetch directly to Supabase REST endpoint
    const restEndpoint = `${cleanUrl}/rest/v1/properties?select=id&limit=1`;
    
    let res: Response;
    try {
      res = await fetch(restEndpoint, {
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`,
        },
      });
    } catch (fetchErr: any) {
      const errMsg = fetchErr?.message || '';
      if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) {
        return NextResponse.json({
          success: false,
          code: 'DNS_NOT_FOUND',
          cleanUrl,
          cleanKey,
          message: `ناونیشانی پڕۆژەکە (${cleanUrl}) نەدۆزرایەوە! تکایە ناونیشانی دروستی پڕۆژە لە Supabase Settings > API وەربگرە.`,
        });
      }
      return NextResponse.json({
        success: false,
        code: 'NETWORK_ERROR',
        cleanUrl,
        cleanKey,
        message: `پەیوەندی لە ڕێگەی هێڵەکەتەوە شکستی هێنا: ${errMsg}`,
      });
    }

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({
        success: false,
        code: 'AUTH_FAILED',
        cleanUrl,
        cleanKey,
        message: 'ناونیشانی URL دروستە، بەڵام کلیلەی Anon Key هەڵەیە یان بەسەرچووە!',
      });
    }

    if (res.status === 404) {
      const text = await res.text();
      if (text.includes('does not exist') || text.includes('relation "public.properties" does not exist')) {
        return NextResponse.json({
          success: true,
          tablesExist: false,
          cleanUrl,
          cleanKey,
          message: 'پەیوەندی دروست بوو، بەڵام خشتەی properties نەدۆزرایەوە. تکایە schema.sql لە SQL Editor ڕەن بکە.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      tablesExist: true,
      cleanUrl,
      cleanKey,
      message: 'پەیوەندی بە سەرکەوتوویی بەسترا و هەموو خشتەکان ئامادەن!',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `هەڵەی نەزانراو: ${err?.message || 'هەڵە'}`,
    });
  }
}
