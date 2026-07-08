'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CHAT_CHAR_LIMIT, isMessageBlocked } from '@/lib/wordFilter';

type Message = {
  id: number;
  anon_number: number;
  body: string;
  is_official: boolean;
  is_pinned: boolean;
  created_at: string;
};

const ChatBox = ({
  anonNumber,
  displayName,
  bannedWords,
  onJoin,
  joining,
  mobile = false
}: {
  anonNumber: number | null;
  displayName: string | null;
  bannedWords: string[];
  onJoin: () => void;
  joining: boolean;
  mobile?: boolean;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 24, y: 88 });
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mobile) {
      try {
        posRef.current = { x: window.innerWidth - 320 - 24, y: 88 };
      } catch {
        posRef.current = { x: 24, y: 88 };
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !mobile && containerRef.current) {
      containerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    }
  }, [ready, mobile]);

  useEffect(() => {
    let active = true;

    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (active && data) setMessages(data as Message[]);
      });

    const channelName = `messages-feed-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          if (active) setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe((status, err) => {
        if (err) console.warn('Realtime subscription error:', err);
      });

    return () => {
      active = false;
      supabase.removeChannel(channel).catch(() => {});
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mobile) return;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y
    };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (mobile || !dragOffset.current || !containerRef.current) return;
    posRef.current = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    };
    containerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
  };

  const handlePointerUp = () => {
    dragOffset.current = null;
  };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !anonNumber) return;
    if (body.length > CHAT_CHAR_LIMIT) return;
    if (isMessageBlocked(body, bannedWords)) {
      setDraft('');
      return;
    }

    setDraft('');
    await supabase
      .from('messages')
      .insert({ anon_number: anonNumber, body, is_official: false });
  };

  const pinned = messages.filter(m => m.is_pinned);
  const feed = messages.filter(m => !m.is_pinned);
  const remaining = CHAT_CHAR_LIMIT - draft.length;
  const joined = anonNumber !== null;

  if (!ready) return null;

  if (mobile) {
    return (
      <div className="z-30 flex flex-col border-t border-chat bg-black/60 font-mono text-xs">
        <div className="flex items-center justify-between bg-chat px-3 py-1.5 select-none">
          <span className="text-white text-xs tracking-wide">CHAT</span>
          <span className="h-2 w-2 rounded-full bg-white animate-blink" />
        </div>
        {pinned.length > 0 && (
          <div className="border-b border-chat/50 bg-white/5 px-2 py-1">
            {pinned.map(m => (
              <div key={m.id} className="text-white font-bold">
                📌 anonymous{m.anon_number}:{' '}
                <span className="font-normal text-chat text-pink-500">
                  {m.body}
                </span>
              </div>
            ))}
          </div>
        )}
        <div
          ref={listRef}
          className="h-36 overflow-y-auto px-2 py-1.5 space-y-1"
        >
          {feed.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-[10px] text-white/25 leading-relaxed">
                no messages yet
                <br />
                be the first to say something
              </p>
            </div>
          ) : (
            feed.map(m => (
              <div key={m.id} className="break-words">
                <span
                  className={
                    m.anon_number === 0
                      ? 'text-chat font-bold'
                      : 'text-white font-bold'
                  }
                >
                  anonymous{m.anon_number}:{' '}
                </span>
                <span className="text-chat text-green-500">{m.body}</span>
              </div>
            ))
          )}
        </div>
        {!joined ? (
          <button
            onClick={onJoin}
            disabled={joining}
            className="flex items-center justify-between bg-chat px-3 py-2 text-xs text-white hover:brightness-110 disabled:opacity-60"
          >
            {joining ? 'joining...' : 'Login to join the chat'}{' '}
            <span aria-hidden>→</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 border-t border-chat/50 p-1.5">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value.slice(0, CHAT_CHAR_LIMIT))}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type here"
              className="flex-1 bg-transparent text-chat placeholder:text-white/30 outline-none"
            />
            <span className="text-[10px] text-white/40">
              {draft.length}/{CHAT_CHAR_LIMIT}
            </span>
            <button
              onClick={sendMessage}
              className="bg-chat px-2 py-1 text-white hover:brightness-110"
              aria-label="send"
            >
              →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        touchAction: 'none',
        willChange: 'transform'
      }}
      className="z-30 flex w-[300px] flex-col border border-chat bg-black/40 font-mono text-xs"
    >
      <div
        onPointerDown={handlePointerDown}
        className="flex cursor-move items-center justify-between bg-chat px-2 py-1.5 select-none"
      >
        <span className="text-white text-xs tracking-wide">CHAT</span>
        <span className="h-2 w-2 rounded-full bg-white animate-blink" />
      </div>

      {pinned.length > 0 && (
        <div className="border-b border-chat/50 bg-white/5 px-2 py-1">
          {pinned.map(m => (
            <div key={m.id} className="text-white font-bold">
              📌 anonymous{m.anon_number}:{' '}
              <span className="font-normal text-chat text-pink-500">
                {m.body}
              </span>
            </div>
          ))}
        </div>
      )}
      <div ref={listRef} className="h-72 overflow-y-auto px-2 py-1.5 space-y-1">
        {feed.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-[10px] text-white/25 leading-relaxed">
              no messages yet
              <br />
              be the first to say something
            </p>
          </div>
        ) : (
          feed.map(m => (
            <div key={m.id} className="break-words">
              <span
                className={
                  m.anon_number === 0
                    ? 'text-chat font-bold'
                    : 'text-white font-bold'
                }
              >
                anonymous{m.anon_number}:{' '}
              </span>
              <span className="text-chat text-green-500">{m.body}</span>
            </div>
          ))
        )}
      </div>
      {!joined ? (
        <button
          onClick={onJoin}
          disabled={joining}
          className="flex items-center justify-between bg-chat px-3 py-2 text-xs text-white hover:brightness-110 disabled:opacity-60"
        >
          {joining ? 'joining...' : 'Login to join the chat'}
          <span aria-hidden>→</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 border-t border-chat/50 p-1.5">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value.slice(0, CHAT_CHAR_LIMIT))}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type here"
            className="flex-1 bg-transparent text-chat placeholder:text-white/30 text-green-500 outline-none"
          />
          <span className="text-[10px] text-white/40">
            {draft.length}/{CHAT_CHAR_LIMIT}
          </span>
          <button
            onClick={sendMessage}
            className="bg-chat px-2 py-1 text-white hover:brightness-110"
            aria-label="send"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
