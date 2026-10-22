import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
}

export function normalizeSupabaseUrl(input: string): string {
  let url = (input || '').trim().replace(/^["']|["']$/g, '');
  if (!url) return '';
  
  // If user pasted the Dashboard browser URL (e.g. https://supabase.com/dashboard/project/xyz/...)
  const dashboardMatch = url.match(/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If user typed .supabase.com instead of .supabase.co
  url = url.replace(/\.supabase\.com(\/.*)?$/i, '.supabase.co');

  // If user entered only the project reference ID (e.g. 'fghqwertyuiop')
  if (!url.includes('.') && !url.includes('/') && !url.startsWith('http')) {
    url = `https://${url}.supabase.co`;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Remove any trailing slashes
  return url.replace(/\/+$/, '');
}

export function normalizeSupabaseKey(input: string): string {
  return (input || '').trim().replace(/^["']|["']$/g, '');
}

export function getSupabaseConfig(): SupabaseConfig | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('rasel_supabase_custom_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        const url = normalizeSupabaseUrl(parsed.url);
        const key = normalizeSupabaseKey(parsed.key);
        if (url && key && url.startsWith('http')) {
          return { url, key };
        }
      }
    } catch (e) {}
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    envUrl && 
    envKey && 
    envUrl !== 'https://your-project-id.supabase.co' && 
    !envUrl.includes('your-project-id')
  ) {
    return { url: normalizeSupabaseUrl(envUrl), key: normalizeSupabaseKey(envKey) };
  }

  return null;
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (cachedClient && lastUsedUrl === config.url && lastUsedKey === config.key) {
    return cachedClient;
  }

  cachedClient = createClient(config.url, config.key);
  lastUsedUrl = config.url;
  lastUsedKey = config.key;
  return cachedClient;
}

export const isSupabaseConfigured = Boolean(getSupabaseConfig());

// Legacy export for backward compatibility
export const supabase = getSupabase();

/**
 * Test a Supabase connection with given credentials
 */
export async function testConnection(rawUrl: string, rawKey: string): Promise<{ 
  success: boolean; 
  message: string; 
  tablesExist?: boolean;
  cleanUrl?: string;
  cleanKey?: string;
}> {
  const url = normalizeSupabaseUrl(rawUrl);
  const key = normalizeSupabaseKey(rawKey);

  if (!url || !url.startsWith('http')) {
    return {
      success: false,
      message: 'ناونیشانی Project URL نادروستە! پێویستە وەک https://xxxx.supabase.co بێت.'
    };
  }

  if (!key || key.length < 20) {
    return {
      success: false,
      message: 'کلیلەی Anon Key نادروست یان کورتە! پێویستە کلیلە درێژەکە بێت کە بە eyJhbGci... دەست پێدەکات.'
    };
  }

  // 1. Try testing via backend API route first
  try {
    const apiRes = await fetch('/api/test-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key }),
    });

    if (apiRes.ok) {
      const result = await apiRes.json();
      return result;
    }
  } catch (apiErr) {
    console.warn('Backend test-supabase failed, falling back to client test:', apiErr);
  }

  // 2. Client-side fallback test
  try {
    const testClient = createClient(url, key);
    const { data, error } = await testClient.from('properties').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.properties" does not exist')) {
        return {
          success: true,
          tablesExist: false,
          cleanUrl: url,
          cleanKey: key,
          message: 'پەیوەندی دروست بوو، بەڵام خشتەکان نەدۆزرانەوە. تکایە schema.sql لە SQL Editor ڕەن بکە.'
        };
      }
      return {
        success: false,
        cleanUrl: url,
        cleanKey: key,
        message: `هەڵە لە پەیوەندی: ${error.message}`
      };
    }

    return {
      success: true,
      tablesExist: true,
      cleanUrl: url,
      cleanKey: key,
      message: 'پەیوەندی بە سەرکەوتوویی بەسترا و خشتەکان ئامادەن!'
    };
  } catch (err: any) {
    const msg = err?.message || '';
    return {
      success: false,
      cleanUrl: url,
      cleanKey: key,
      message: `پەیوەندی سەرکەوتوو نەبوو: ${msg}`
    };
  }
}
