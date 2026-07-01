"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EmailSubscribeModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    setStatus("saving");
    const { error } = await supabase.from("subscribers").insert({ email: value });
    setStatus(error && error.code !== "23505" ? "error" : "done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs border border-chat bg-black p-5 font-mono text-white"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs tracking-widest text-white/70">SUBSCRIBE FOR UPDATES</span>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="close">
            ✕
          </button>
        </div>

        {status === "done" ? (
          <p className="py-3 text-center text-sm text-chat">you're on the list ✓</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              className="w-full border border-white/30 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-chat"
            />
            {status === "error" && <p className="text-xs text-red-400">something went wrong — try again</p>}
            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full bg-chat px-3 py-2 text-xs tracking-wide text-white hover:brightness-110 disabled:opacity-60"
            >
              {status === "saving" ? "saving..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}