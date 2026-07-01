'use client';

import { useState } from 'react';
import {
  saveLinks,
  saveBannedWords,
  saveFlagSettings,
  postOfficialMessage,
  togglePin,
  resolveFlag
} from '@/lib/adminActions';

type DashboardData = {
  links: { presave_url: string; subscribe_url: string };
  bannedWords: string[];
  flagSettings: {
    webcam_nsfw_enabled: boolean;
    webcam_nsfw_threshold: number;
    chat_filter_enabled: boolean;
  };
  openFlags: any[];
  pinnedMessages: any[];
};

const AdminPanel = ({ initialData }: { initialData: DashboardData }) => {
  const [links, setLinks] = useState(initialData.links);
  const [bannedWordsText, setBannedWordsText] = useState(
    initialData.bannedWords.join('\n')
  );
  const [flagSettings, setFlagSettings] = useState(initialData.flagSettings);
  const [officialMsg, setOfficialMsg] = useState('');
  const [pinIt, setPinIt] = useState(true);
  const [savedNote, setSavedNote] = useState('');

  function flash(msg: string) {
    setSavedNote(msg);
    setTimeout(() => setSavedNote(''), 1800);
  }

  return (
    <div className="min-h-screen bg-black p-6 font-mono text-sm text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg tracking-widest">GIRLSET ADMIN</h1>
          {savedNote && <span className="text-xs text-chat">{savedNote}</span>}
        </div>

        <section className="space-y-2 border border-white/20 p-4">
          <h2 className="text-xs tracking-widest text-white/50">
            LINKS (top bar buttons)
          </h2>
          <label className="block text-xs text-white/40">Pre-Save URL</label>
          <input
            value={links.presave_url}
            onChange={e =>
              setLinks(l => ({ ...l, presave_url: e.target.value }))
            }
            className="w-full border border-white/30 bg-transparent px-2 py-1"
          />
          <button
            onClick={async () => {
              await saveLinks(links.presave_url, links.subscribe_url);
              flash('links saved');
            }}
            className="border border-white px-3 py-1 text-xs hover:bg-white hover:text-black"
          >
            SAVE LINK
          </button>
        </section>

        <section className="space-y-2 border border-white/20 p-4">
          <h2 className="text-xs tracking-widest text-white/50">
            Blocked Words
          </h2>
          <p className="text-xs text-white/40">
            Seperate by comma (word1 , word2 , word3)
          </p>
          <textarea
            value={bannedWordsText}
            onChange={e => setBannedWordsText(e.target.value)}
            rows={5}
            className="w-full border border-white/30 bg-transparent px-2 py-1"
          />
          <button
            onClick={async () => {
              await saveBannedWords(
                bannedWordsText
                  .split(',')
                  .map(w => w.trim())
                  .filter(Boolean)
              );
              flash('word list saved');
            }}
            className="border border-white px-3 py-1 text-xs hover:bg-white hover:text-black"
          >
            SAVE WORD LIST
          </button>
        </section>
        {/* 
        <section className="space-y-2 border border-white/20 p-4">
          <h2 className="text-xs tracking-widest text-white/50">FLAGGING OPTIONS</h2>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={flagSettings.webcam_nsfw_enabled}
              onChange={(e) => setFlagSettings((f) => ({ ...f, webcam_nsfw_enabled: e.target.checked }))}
            />
            Enable webcam NSFW soft-flagging
          </label>
          <label className="block text-xs text-white/40">
            Confidence threshold (0–1) — lower catches more, more false positives
          </label>
          <input
            type="number"
            step="0.05"
            min={0}
            max={1}
            value={flagSettings.webcam_nsfw_threshold}
            onChange={(e) => setFlagSettings((f) => ({ ...f, webcam_nsfw_threshold: Number(e.target.value) }))}
            className="w-24 border border-white/30 bg-transparent px-2 py-1"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={flagSettings.chat_filter_enabled}
              onChange={(e) => setFlagSettings((f) => ({ ...f, chat_filter_enabled: e.target.checked }))}
            />
            Enable chat word filter
          </label>
          <p className="text-xs text-white/30">
            Note: flagged webcam frames are never uploaded anywhere — only a confidence score + anon number land here for review.
          </p>
          <button
            onClick={async () => {
              await saveFlagSettings(flagSettings.webcam_nsfw_enabled, flagSettings.webcam_nsfw_threshold, flagSettings.chat_filter_enabled);
              flash("flag settings saved");
            }}
            className="border border-white px-3 py-1 text-xs hover:bg-white hover:text-black"
          >
            SAVE FLAG SETTINGS
          </button>
        </section> */}

        <section className="space-y-2 border border-white/20 p-4">
          <h2 className="text-xs tracking-widest text-white/50">
            POST AS ANONYMOUS0 (official)
          </h2>
          <input
            value={officialMsg}
            onChange={e => setOfficialMsg(e.target.value.slice(0, 60))}
            placeholder="announcement... (60 char max)"
            className="w-full border border-white/30 bg-transparent px-2 py-1 text-chat"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={pinIt}
              onChange={e => setPinIt(e.target.checked)}
            />
            Pin this message
          </label>
          <button
            onClick={async () => {
              await postOfficialMessage(officialMsg, pinIt);
              setOfficialMsg('');
              flash('posted');
            }}
            className="border border-white px-3 py-1 text-xs hover:bg-white hover:text-black"
          >
            POST
          </button>
        </section>

        <section className="space-y-2 border border-white/20 p-4">
          <h2 className="text-xs tracking-widest text-white/50">
            CURRENTLY PINNED
          </h2>
          {initialData.pinnedMessages.length === 0 && (
            <p className="text-xs text-white/30">none</p>
          )}
          {initialData.pinnedMessages.map(m => (
            <div
              key={m.id}
              className="flex items-center justify-between text-xs"
            >
              <span>
                anonymous{m.anon_number}: {m.body}
              </span>
              <button
                onClick={async () => {
                  await togglePin(m.id, false);
                  flash('unpinned — refresh to update list');
                }}
                className="border border-white/30 px-2 py-0.5 hover:border-white"
              >
                UNPIN
              </button>
            </div>
          ))}
        </section>
        {/* 
        <section className="space-y-2 border border-white/20 p-4">
          <h2 className="text-xs tracking-widest text-white/50">OPEN FLAGS ({initialData.openFlags.length})</h2>
          {initialData.openFlags.length === 0 && <p className="text-xs text-white/30">nothing pending</p>}
          {initialData.openFlags.map((f) => (
            <div key={f.id} className="flex items-center justify-between text-xs">
              <span>
                [{f.kind}] anonymous{f.anon_number ?? "?"} — confidence {f.confidence ?? "n/a"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={async () => {
                    await resolveFlag(f.id, "reviewed");
                    flash("marked reviewed — refresh to update list");
                  }}
                  className="border border-white/30 px-2 py-0.5 hover:border-white"
                >
                  REVIEWED
                </button>
                <button
                  onClick={async () => {
                    await resolveFlag(f.id, "dismissed");
                    flash("dismissed — refresh to update list");
                  }}
                  className="border border-white/30 px-2 py-0.5 hover:border-white"
                >
                  DISMISS
                </button>
              </div>
            </div>
          ))}
        </section> */}
      </div>
    </div>
  );
};

export default AdminPanel;
