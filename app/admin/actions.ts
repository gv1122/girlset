'use server';

import { cookies } from 'next/headers';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

const COOKIE_NAME = 'girlset_admin';

export const login = async (password: string) => {
  if (password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, error: 'Wrong password.' };
  }
  cookies().set(COOKIE_NAME, process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8 // 8 hours
  });
  return { ok: true };
};

export const saveLinks = async (presaveUrl: string, subscribeUrl: string) => {
  await supabaseAdmin.from('admin_settings').upsert({
    key: 'links',
    value: { presave_url: presaveUrl, subscribe_url: subscribeUrl }
  });
};

export const togglePin = async (id: number, pinned: boolean) => {
  await supabaseAdmin
    .from('messages')
    .update({ is_pinned: pinned })
    .eq('id', id);
};

export const saveBannedWords = async (words: string[]) => {
  await supabaseAdmin
    .from('admin_settings')
    .upsert({ key: 'banned_words', value: words });
};

export const saveFlagSettings = async (
  enabled: boolean,
  threshold: number,
  chatFilterEnabled: boolean
) => {
  await supabaseAdmin.from('admin_settings').upsert({
    key: 'flag_settings',
    value: {
      webcam_nsfw_enabled: enabled,
      webcam_nsfw_threshold: threshold,
      chat_filter_enabled: chatFilterEnabled
    }
  });
};

export const postOfficialMessage = async (body: string, pinned: boolean) => {
  if (!body.trim() || body.length > 60) return;
  await supabaseAdmin.from('messages').insert({
    anon_number: 0,
    body: body.trim(),
    is_official: true,
    is_pinned: pinned
  });
};

export const resolveFlag = async (
  id: number,
  status: 'reviewed' | 'dismissed'
) => {
  await supabaseAdmin.from('flags').update({ status }).eq('id', id);
};

export const clearChat = async () => {
  await supabaseAdmin.from('messages').delete().neq('id', 0);
};

export const exportSubscribers = async (): Promise<string> => {
  const { data } = await supabaseAdmin
    .from('subscribers')
    .select('email, country, opted_in_at')
    .order('opted_in_at', { ascending: true });

  if (!data || data.length === 0) return 'email,country,opted_in_at\n';

  const header = 'email,country,opted_in_at';
  const rows = data.map(
    r => `${r.email},${r.country ?? ''},${r.opted_in_at ?? ''}`
  );
  return [header, ...rows].join('\n');
};
