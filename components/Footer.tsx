'use client';

import type { FilterMode } from '@/components/Stage';

import { FaInstagram, FaTiktok, FaXTwitter } from 'react-icons/fa6';

export type SiteMode = 'webcam' | 'webcam_chat' | 'chat';
export type SocialMode = 'twitter' | 'instagram' | 'tiktok';

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'normal', label: '1' },
  { key: 'bw', label: '2' },
  { key: 'xray', label: '3' }
];

const MODES: { key: SiteMode; label: string }[] = [
  { key: 'webcam', label: 'WEBCAM' },
  { key: 'webcam_chat', label: 'WEBCAM + CHAT' },
  { key: 'chat', label: 'CHAT' }
];

const SOCIALS = [
  {
    key: 'twitter',
    href: 'https://x.com/GIRLSETofficial',
    icon: FaXTwitter
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/',
    icon: FaInstagram
  },
  {
    key: 'tiktok',
    href: 'https://www.tiktok.com/',
    icon: FaTiktok
  }
];

export default function Footer({
  showMedia,
  filter,
  onFilter,
  mode,
  onMode,
  canvas,
  showEyeBarToggle,
  eyeBarOn,
  onEyeBarToggle,
  sourceSelected
}: {
  showMedia: boolean;
  filter: FilterMode;
  onFilter: (f: FilterMode) => void;
  mode: SiteMode;
  onMode: (m: SiteMode) => void;
  canvas: HTMLCanvasElement | null;
  showEyeBarToggle: boolean;
  eyeBarOn: boolean;
  onEyeBarToggle: () => void;
  sourceSelected: boolean;
}) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  function handleDownload() {
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'girlset.png';
    a.click();
  }

  return (
    <footer className="relative z-20 flex h-12 w-full items-center justify-between bg-chat px-4 font-mono text-xs text-white">
      <div className="flex items-center gap-2">
        {showMedia && (
          <>
            <span className="text-[11px]">Filters:</span>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => sourceSelected && onFilter(f.key)}
                disabled={!sourceSelected}
                className={`h-7 w-7 text-xs transition-colors ${
                  filter === f.key
                    ? 'bg-white text-black'
                    : 'bg-white/30 text-white hover:bg-white/50'
                } ${!sourceSelected ? 'cursor-not-allowed opacity-30' : ''}`}
              >
                {f.label}
              </button>
            ))}
            {showEyeBarToggle && (
              <button
                onClick={() => sourceSelected && onEyeBarToggle()}
                disabled={!sourceSelected}
                title="Toggle eye bar"
                className={`h-7 px-2 text-[10px] tracking-wide transition-colors ${
                  eyeBarOn
                    ? 'bg-white text-black'
                    : 'bg-white/30 text-white hover:bg-white/50'
                } ${!sourceSelected ? 'cursor-not-allowed opacity-30' : ''}`}
              >
                EYE
              </button>
            )}
          </>
        )}
      </div>

      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-1 sm:flex">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => onMode(m.key)}
            className={`px-2 py-1 text-[10px] tracking-wide ${
              mode === m.key
                ? 'bg-white text-black'
                : 'text-white/70 transition-colors hover:bg-white/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {showMedia &&
          SOCIALS.map(social => {
            const Icon = social.icon;

            return (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-7 w-7 items-center justify-center bg-white/30 text-white transition-colors hover:bg-white/50 active:bg-white active:text-black"
                aria-label={social.key}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
      </div>
    </footer>
  );
}
