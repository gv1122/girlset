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
