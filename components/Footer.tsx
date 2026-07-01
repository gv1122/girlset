"use client";

import type { FilterMode } from "@/components/Stage";

export type SiteMode = "webcam" | "webcam_chat" | "chat";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "normal", label: "1" },
  { key: "bw", label: "2" },
  { key: "xray", label: "3" },
];

const MODES: { key: SiteMode; label: string }[] = [
  { key: "webcam", label: "WEBCAM" },
  { key: "webcam_chat", label: "WEBCAM + CHAT" },
  { key: "chat", label: "CHAT" },
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
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleDownload() {
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "girlset.png";
    a.click();
  }

  return (
    <footer className="relative z-20 flex h-12 w-full items-center justify-between bg-chat px-4 font-mono text-xs text-white">
      <div className="flex items-center gap-2">
        {showMedia && (
          <>
            <span className="text-[11px]">Filters:</span>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => sourceSelected && onFilter(f.key)}
                disabled={!sourceSelected}
                className={`h-7 w-7 text-xs transition-colors ${
                  filter === f.key ? "bg-white text-black" : "bg-white/30 text-white hover:bg-white/50"
                } ${!sourceSelected ? "cursor-not-allowed opacity-30" : ""}`}
              >
                {f.label}
              </button>
            ))
			}
            {showEyeBarToggle && (
              <button
                onClick={() => sourceSelected && onEyeBarToggle()}
                disabled={!sourceSelected}
                title="Toggle eye bar"
                className={`h-7 px-2 text-[10px] tracking-wide transition-colors ${
                  eyeBarOn ? "bg-white text-black" : "bg-white/30 text-white hover:bg-white/50"
                } ${!sourceSelected ? "cursor-not-allowed opacity-30" : ""}`}
              >
                EYE
              </button>
            )}
          </>
        )}
      </div>

      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-1 sm:flex">
		{MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => onMode(m.key)}
            className={`px-2 py-1 text-[10px] tracking-wide ${
              mode === m.key ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {showMedia && (
          <>
            <span className="text-[11px]">Share on:</span>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("live on GIRLSET right now")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Facebook
            </a>
            <button onClick={handleDownload} className="bg-white px-2 py-1 text-black hover:bg-white/80">
              DOWNLOAD
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
