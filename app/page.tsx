"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAnonIdentity } from "@/lib/useAnonIdentity";
import Header from "@/components/Header";
import CornerBrackets from "@/components/CornerBrackets";
import Stage, { FilterMode, StageSource } from "@/components/Stage";
import ChatBox from "@/components/ChatBox";
import Footer, { SiteMode } from "@/components/Footer";

export default function Home() {
  const { anonNumber, displayName, loading: claiming, claim } = useAnonIdentity();

  const [mode, setMode] = useState<SiteMode>("webcam_chat");
  const [source, setSource] = useState<StageSource>("idle");
  const [eyeBarOn, setEyeBarOn] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("normal");
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const [links, setLinks] = useState({ presave_url: "", subscribe_url: "" });
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [flagSettings, setFlagSettings] = useState({ webcam_nsfw_enabled: true, webcam_nsfw_threshold: 0.75 });

  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("key, value")
      .then(({ data }) => {
        if (!data) return;
        for (const row of data) {
          if (row.key === "links") setLinks(row.value);
          if (row.key === "banned_words") setBannedWords(row.value ?? []);
          if (row.key === "flag_settings") setFlagSettings(row.value);
        }
      });
  }, []);

  const showMedia = mode !== "chat";
  const showChat = mode !== "webcam";

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <Header presaveUrl={links.presave_url} />
      <div className="relative flex-1 min-h-0">
		<CornerBrackets />
        {showMedia ? (
          <Stage
            source={source}
            onSourceChange={setSource}
            filter={filter}
            eyeBarEnabled={eyeBarOn}
            anonNumber={anonNumber}
            nsfwFlagging={{ enabled: flagSettings.webcam_nsfw_enabled, threshold: flagSettings.webcam_nsfw_threshold }}
            onCanvasReady={setCanvas}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        {showChat && (
          <ChatBox
            anonNumber={anonNumber}
            displayName={displayName}
            bannedWords={bannedWords}
            onJoin={claim}
            joining={claiming}
          />
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
        onEyeBarToggle={() => setEyeBarOn((v) => !v)}
		sourceSelected={source !== "idle"}
      />
    </main>
  );
}
