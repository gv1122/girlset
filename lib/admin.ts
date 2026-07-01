import { cookies } from 'next/headers';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

const COOKIE_NAME = 'girlset_admin';

export const isAdmin = async () => {
  return cookies().get(COOKIE_NAME)?.value === process.env.ADMIN_PASSWORD;
};

export const getDashboardData = async () => {
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
};
