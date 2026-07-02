'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const guessIsUS = (): boolean => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.startsWith('America/');
  } catch {
    return false;
  }
};

const guessCountry = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (tz.startsWith('America/')) return 'US';
    if (tz.startsWith('Europe/London')) return 'GB';
    if (tz.startsWith('Europe/')) return 'EU';
    if (tz.startsWith('Australia/')) return 'AU';
    if (tz.startsWith('Asia/Tokyo')) return 'JP';

    return tz;
  } catch {
    return 'unknown';
  }
};

const EmailSubscribeModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [consented, setConsented] = useState(guessIsUS());
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>(
    'idle'
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = email.trim();
    if (!value || !consented) return;

    setStatus('saving');
    const { error } = await supabase.from('subscribers').insert({
      email: value,
      country: guessCountry(),
      opted_in_at: new Date().toISOString()
    });

    setStatus(error && error.code !== '23505' ? 'error' : 'done');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm border border-chat bg-black p-5 font-mono text-white"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs tracking-widest text-white/70">
            SUBSCRIBE FOR UPDATES
          </span>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {status === 'done' ? (
          <p className="py-3 text-center text-sm text-chat">
            you're on the list ✓
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your email"
              className="w-full border border-white/30 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-chat"
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consented}
                onChange={e => setConsented(e.target.checked)}
                className="mt-0.5 shrink-0 accent-chat"
              />
              <span className="text-[10px] leading-relaxed text-white/60">
                Sign up for updates from GIRLSET. Emails will be sent by or on
                behalf of Universal Music Group 2220 Colorado Avenue, Santa
                Monica, CA 90404 (310) 865-4000. You may withdraw your consent
                at any time.
                <span className="mt-2 flex gap-3">
                  <a
                    href="http://privacypolicy.umusic.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-chat underline underline-offset-2 hover:brightness-125"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-white/20">|</span>
                  <a
                    href="https://www.universalmusic.com/CCPA/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-chat underline underline-offset-2 hover:brightness-125"
                  >
                    Do Not Sell My Personal Information
                  </a>
                </span>
              </span>
            </label>

            {status === 'error' && (
              <p className="text-xs text-red-400">
                something went wrong — try again
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'saving' || !consented}
              className="w-full bg-chat px-3 py-2 text-xs tracking-wide text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'saving' ? 'saving...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailSubscribeModal;
