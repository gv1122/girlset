'use client';
import { useState } from 'react';
import EmailSubscribeModal from '@/components/EmailSubscribeModal';

function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 bg-chat px-3 py-1.5 text-xs text-white hover:brightness-110 transition-[filter]"
    >
      {label} <span aria-hidden>→</span>
    </a>
  );
}

export default function Header({
  presaveUrl,
  siteUrl = 'GIRLSINTHECHAT.COM'
}: {
  presaveUrl: string;
  siteUrl?: string;
}) {
  const [showSubscribe, setShowSubscribe] = useState(false);

  return (
    <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-white/10 bg-black px-6 font-mono">
      <div className="flex items-center gap-3">
        <span className="text-xl tracking-[0.25em] text-white">GIRLSET</span>

        {presaveUrl && (
          <a
            href={presaveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-chat px-3 py-1.5 text-xs text-white hover:brightness-110 transition-[filter]"
          >
            Pre-Save the new song <span aria-hidden>→</span>
          </a>
        )}

        <button
          onClick={() => setShowSubscribe(true)}
          className="inline-flex items-center gap-2 bg-chat px-3 py-1.5 text-xs text-white hover:brightness-110 transition-[filter]"
        >
          Subscribe to emails <span aria-hidden>→</span>
        </button>
      </div>

      <span className="text-sm tracking-[0.15em] text-white">{siteUrl}</span>

      {showSubscribe && (
        <EmailSubscribeModal onClose={() => setShowSubscribe(false)} />
      )}
    </header>
  );
}
