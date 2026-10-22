import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { normalizeSupabaseUrl, normalizeSupabaseKey } from '@/lib/supabase';

function ensureUUID(id: string | null | undefined): string {
  if (!id) return randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return randomUUID();
}

export async function POST(req: NextRequest) {
  try {
    const { url, key, properties, contracts, transactions } = await req.json();

    if (!url || !key) {
      return NextResponse.json(
        { success: false, message: 'URL و کلیلەی Supabase داواکراون!' },
        { status: 400 }
      );
    }

    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = normalizeSupabaseKey(key);

    const sb = createClient(cleanUrl, cleanKey);

    // Prepare properties with valid UUIDs
    const idMap = new Map<string, string>();
    const preparedProperties = (properties || []).map((p: any) => {
      const newId = ensureUUID(p.id);
      idMap.set(p.id, newId);
      return {
        ...p,
        id: newId,
        features: Array.isArray(p.features) ? p.features : [],
        images: Array.isArray(p.images) ? p.images : [],
        documents: Array.isArray(p.documents) ? p.documents : [],
        owner_contact: p.owner_contact || {},
      };
    });

    // Prepare contracts with updated property_id
    const preparedContracts = (contracts || []).map((c: any) => {
      const propId = idMap.get(c.property_id) || ensureUUID(c.property_id);
      return {
        ...c,
        id: ensureUUID(c.id),
        property_id: propId,
      };
    });

    // Prepare transactions
    const preparedTransactions = (transactions || []).map((t: any) => {
      const propId = t.property_id ? (idMap.get(t.property_id) || ensureUUID(t.property_id)) : null;
      return {
        ...t,
        id: ensureUUID(t.id),
        property_id: propId,
      };
    });

    // 1. Insert properties
    if (preparedProperties.length > 0) {
      const { error: propErr } = await sb.from('properties').upsert(preparedProperties);
      if (propErr) {
        return NextResponse.json({
          success: false,
          message: `هەڵە لە پاشەکەوتکردنی موڵکەکان لە Supabase: ${propErr.message}`,
        }, { status: 400 });
      }
    }

    // 2. Insert contracts
    if (preparedContracts.length > 0) {
      const { error: cntErr } = await sb.from('contracts').upsert(preparedContracts);
      if (cntErr) {
        return NextResponse.json({
          success: false,
          message: `هەڵە لە پاشەکەوتکردنی گرێبەستەکان لە Supabase: ${cntErr.message}`,
        }, { status: 400 });
      }
    }

    // 3. Insert transactions
    if (preparedTransactions.length > 0) {
      const { error: txErr } = await sb.from('financial_transactions').upsert(preparedTransactions);
      if (txErr) {
        return NextResponse.json({
          success: false,
          message: `هەڵە لە پاشەکەوتکردنی دارایی لە Supabase: ${txErr.message}`,
        }, { status: 400 });
      }
    }

    const totalCount = preparedProperties.length + preparedContracts.length + preparedTransactions.length;

    return NextResponse.json({
      success: true,
      count: totalCount,
      cleanUrl,
      updatedProperties: preparedProperties,
      message: `سەرکەوتوو بوو! ${totalCount} تۆمار بە سەرکەوتوویی لە Supabase پاشەکەوت کران.`,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `هەڵە لە سێرڤەر: ${err?.message || 'هەڵەی نەزانراو'}`,
    }, { status: 500 });
  }
}
