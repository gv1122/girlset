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

  const handleCapture = async () => {
    const isMobileDevice = window.innerWidth < 640;

    try {
      const html2canvas = (await import('html2canvas')).default;

      if (!stageContainerRef.current) return;

      const shot = await html2canvas(stageContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        scale: isMobileDevice ? 0.5 : 1,
        ignoreElements: el => el.hasAttribute('data-html2canvas-ignore')
      });

      const dataUrl = shot.toDataURL('image/png');

      if (isMobileDevice && navigator.share && navigator.canShare) {
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
    } catch {
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');

      if (isMobileDevice && navigator.share && navigator.canShare) {
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

          {/* Desktop: draggable overlay */}
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

          {/* Mobile: anchored to bottom, still inside the capture area */}
          {showChat && (
            <div className="absolute bottom-0 left-0 right-0 sm:hidden">
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
        </div>

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
