'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const COOKIE_NAME = 'girlset_admin';

export async function login(password: string) {
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
}

export async function isAdmin() {
  return cookies().get(COOKIE_NAME)?.value === process.env.ADMIN_PASSWORD;
}

export async function saveLinks(presaveUrl: string, subscribeUrl: string) {
  await supabaseAdmin
    .from('admin_settings')
    .upsert({
      key: 'links',
      value: { presave_url: presaveUrl, subscribe_url: subscribeUrl }
    });
}

export async function saveBannedWords(words: string[]) {
  await supabaseAdmin
    .from('admin_settings')
    .upsert({ key: 'banned_words', value: words });
}

export async function saveFlagSettings(
  enabled: boolean,
  threshold: number,
  chatFilterEnabled: boolean
) {
  await supabaseAdmin.from('admin_settings').upsert({
    key: 'flag_settings',
    value: {
      webcam_nsfw_enabled: enabled,
      webcam_nsfw_threshold: threshold,
      chat_filter_enabled: chatFilterEnabled
    }
  });
}

export async function postOfficialMessage(body: string, pinned: boolean) {
  if (!body.trim() || body.length > 60) return;
  await supabaseAdmin
    .from('messages')
    .insert({
      anon_number: 0,
      body: body.trim(),
      is_official: true,
      is_pinned: pinned
    });
}

export async function togglePin(id: number, pinned: boolean) {
  await supabaseAdmin
    .from('messages')
    .update({ is_pinned: pinned })
    .eq('id', id);
}

export async function resolveFlag(
  id: number,
  status: 'reviewed' | 'dismissed'
) {
  await supabaseAdmin.from('flags').update({ status }).eq('id', id);
}

export async function getDashboardData() {
  const [links, bannedWords, flagSettings, openFlags, pinnedMessages] =
    await Promise.all([
      supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'links')
        .single(),
      supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'banned_words')
        .single(),
      supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'flag_settings')
        .single(),
      supabaseAdmin
        .from('flags')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('messages')
        .select('*')
        .eq('is_pinned', true)
        .order('created_at', { ascending: false })
    ]);

  return {
    links: links.data?.value ?? { presave_url: '', subscribe_url: '' },
    bannedWords: bannedWords.data?.value ?? [],
    flagSettings: flagSettings.data?.value ?? {
      webcam_nsfw_enabled: true,
      webcam_nsfw_threshold: 0.75,
      chat_filter_enabled: true
    },
    openFlags: openFlags.data ?? [],
    pinnedMessages: pinnedMessages.data ?? []
  };
}
