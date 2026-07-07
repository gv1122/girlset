'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { useAnonIdentity } from '@/lib/useAnonIdentity';
import Header from '@/components/Header';
import CornerBrackets from '@/components/CornerBrackets';
import Stage, { FilterMode, StageSource } from '@/components/Stage';
import Footer, { SiteMode } from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

const ChatBox = dynamic(() => import('@/components/ChatBox'), { ssr: false });

const Home = () => {
  const {
    anonNumber,
    displayName,
    loading: claiming,
    claim
  } = useAnonIdentity();

  const [mode, setMode] = useState<SiteMode>('webcam_chat');
  const [source, setSource] = useState<StageSource>('idle');
  const [eyeBarOn, setEyeBarOn] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('normal');
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const [links, setLinks] = useState({ presave_url: '', subscribe_url: '' });
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [flagSettings, setFlagSettings] = useState({
    webcam_nsfw_enabled: true,
    webcam_nsfw_threshold: 0.75
  });

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      document.body.innerHTML = `<div style="position:fixed;inset:0;background:#000;color:#f00;font-family:monospace;font-size:12px;padding:20px;overflow:auto;z-index:99999;white-space:pre-wrap;">${e.message}\n\n${e.filename}:${e.lineno}\n\n${e.error?.stack ?? ''}</div>`;
    };
    const unhandled = (e: PromiseRejectionEvent) => {
      document.body.innerHTML = `<div style="position:fixed;inset:0;background:#000;color:#f00;font-family:monospace;font-size:12px;padding:20px;overflow:auto;z-index:99999;white-space:pre-wrap;">UNHANDLED REJECTION\n\n${e.reason?.stack ?? e.reason}</div>`;
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', unhandled);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', unhandled);
    };
  }, []);

  const handleCapture = async () => {
    const isMobileDevice = window.innerWidth < 640;

    if (isMobileDevice) {
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');

      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'girlset.png', { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'GIRLSET' });
            return;
          }
        } catch {}
      }

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'girlset.png';
      a.click();

      return;
    }

    if (!stageContainerRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const shot = await html2canvas(stageContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        scale: 1
      });
      const dataUrl = shot.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'girlset.png';
      a.click();
    } catch {
      if (!canvas) return;

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'girlset.png';
      a.click();
    }
  };

  useEffect(() => {
    supabase
      .from('admin_settings')
      .select('key, value')
      .then(({ data }) => {
        if (!data) return;
        for (const row of data) {
          if (row.key === 'links') setLinks(row.value);
          if (row.key === 'banned_words') setBannedWords(row.value ?? []);
          if (row.key === 'flag_settings') setFlagSettings(row.value);
        }
      });
  }, []);

  const showMedia = mode !== 'chat';
  const showChat = mode !== 'webcam';

  return (
    <ErrorBoundary>
      <main className="flex h-dvh w-screen flex-col overflow-hidden bg-black">
        <Header presaveUrl={links.presave_url} />
        <div ref={stageContainerRef} className="relative flex-1 min-h-0">
          <CornerBrackets />
          {showMedia ? (
            <Stage
              source={source}
              onSourceChange={setSource}
              filter={filter}
              eyeBarEnabled={eyeBarOn}
              anonNumber={anonNumber}
              nsfwFlagging={{
                enabled: flagSettings.webcam_nsfw_enabled,
                threshold: flagSettings.webcam_nsfw_threshold
              }}
              onCanvasReady={setCanvas}
              onCapture={handleCapture}
            />
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}
          {showChat && (
            <div className="hidden sm:contents">
              <ChatBox
                anonNumber={anonNumber}
                displayName={displayName}
                bannedWords={bannedWords}
                onJoin={claim}
                joining={claiming}
                mobile={false}
              />
            </div>
          )}
        </div>

        {showChat && (
          <div className="sm:hidden shrink-0">
            <ChatBox
              anonNumber={anonNumber}
              displayName={displayName}
              bannedWords={bannedWords}
              onJoin={claim}
              joining={claiming}
              mobile={true}
            />
          </div>
        )}

        <Footer
          showMedia={showMedia}
          filter={filter}
          onFilter={setFilter}
          mode={mode}
          onMode={setMode}
          canvas={showMedia ? canvas : null}
          showEyeBarToggle={showMedia}
          eyeBarOn={eyeBarOn}
          onEyeBarToggle={() => setEyeBarOn(v => !v)}
          sourceSelected={source !== 'idle'}
        />
      </main>
    </ErrorBoundary>
  );
};

export default Home;
