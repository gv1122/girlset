'use client';

import { useState } from 'react';
import Image from 'next/image';
import EmailSubscribeModal from '@/components/EmailSubscribeModal';

export default function Header({
  presaveUrl,
  siteUrl = 'GIRLSINTHECHAT.COM'
}: {
  presaveUrl: string;
  siteUrl?: string;
}) {
  const [showSubscribe, setShowSubscribe] = useState(false);

  return (
    <header className="relative z-20 flex h-14 w-full items-center justify-between border-b border-white/10 bg-black px-3 sm:px-6 font-mono">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src="/logo.png"
          alt="GIRLSET"
          className="block h-10 w-auto shrink-0"
        />

        {presaveUrl && (
          <a
            href={presaveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 bg-chat px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white hover:brightness-110 transition-[filter] whitespace-nowrap"
          >
            <span className="hidden sm:inline">Pre-Save the new song</span>
            <span className="sm:hidden">Pre-Save</span>
            <span aria-hidden>→</span>
          </a>
        )}

        <button
          onClick={() => setShowSubscribe(true)}
          className="inline-flex items-center gap-1 bg-chat px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white hover:brightness-110 transition-[filter] whitespace-nowrap"
        >
          <span className="hidden sm:inline">Subscribe to emails</span>
          <span className="sm:hidden">Subscribe</span>
          <span aria-hidden>→</span>
        </button>
      </div>
      <span className="hidden sm:block text-sm tracking-[0.15em] text-white shrink-0 ml-4">
        {siteUrl}
      </span>

      {showSubscribe && (
        <EmailSubscribeModal onClose={() => setShowSubscribe(false)} />
      )}
    </header>
  );
}
