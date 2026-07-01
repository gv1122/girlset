'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type FilterMode = 'normal' | 'bw' | 'xray';
export type StageSource = 'idle' | 'camera' | 'image';

type Props = {
  source: StageSource;
  onSourceChange: (s: StageSource) => void;
  filter: FilterMode;
  eyeBarEnabled: boolean;
  anonNumber: number | null;
  nsfwFlagging: { enabled: boolean; threshold: number };
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onCapture?: () => void;
};

const Stage = ({
  source,
  onSourceChange,
  filter,
  eyeBarEnabled,
  anonNumber,
  nsfwFlagging,
  onCanvasReady,
  onCapture
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (source !== 'camera') {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false
      })
      .then(stream => {
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() =>
        setError(
          'Camera access was denied. Allow camera access to use this mode.'
        )
      );

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [source]);

  useEffect(() => {
    if (!eyeBarEnabled || source !== 'camera') return;
    let cancelled = false;

    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } =
          await import('@mediapipe/tasks-vision');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1
          }
        );
        if (!cancelled) landmarkerRef.current = landmarker;
      } catch {
        // silently fail !
        landmarkerRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current = null;
    };
  }, [eyeBarEnabled, source]);

  const applyFilter = (ctx: CanvasRenderingContext2D) => {
    ctx.filter =
      filter === 'bw'
        ? 'grayscale(1) contrast(1.1)'
        : filter === 'xray'
          ? 'grayscale(1) invert(1) contrast(1.2)'
          : 'none';
  };

  const drawEyeBar = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    if (!eyeBarEnabled || !landmarkerRef.current || source !== 'camera') return;

    try {
      const result = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      );

      const lm = result?.faceLandmarks?.[0];
      if (!lm) return;

      const leftEye = [33, 133];
      const rightEye = [362, 263];
      const xs = [...leftEye, ...rightEye].map(i => lm[i].x * canvas.width);
      const ys = [...leftEye, ...rightEye].map(i => lm[i].y * canvas.height);
      const minX = Math.min(...xs) - canvas.width * 0.06;
      const maxX = Math.max(...xs) + canvas.width * 0.06;
      const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
      const barHeight = canvas.width * 0.045;

      ctx.fillStyle = '#000000';
      ctx.fillRect(minX, midY - barHeight / 2, maxX - minX, barHeight);
    } catch {
      // skip
    }
  };

  useEffect(() => {
    if (source !== 'camera') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFlagCheck = 0;

    const draw = () => {
      if (video!.readyState >= 2) {
        canvas!.width = video!.videoWidth;
        canvas!.height = video!.videoHeight;

        applyFilter(ctx!);
        ctx!.drawImage(video!, 0, 0, canvas!.width, canvas!.height);
        ctx!.filter = 'none';

        drawEyeBar(ctx!, canvas!);

        const now = performance.now();
        if (nsfwFlagging.enabled && now - lastFlagCheck > 4000) {
          lastFlagCheck = now;
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [source, filter, eyeBarEnabled, nsfwFlagging, anonNumber]);

  useEffect(() => {
    if (source !== 'image') return;

    const canvas = canvasRef.current;
    const img = imageElRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    applyFilter(ctx);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  }, [source, filter]);

  useEffect(() => {
    onCanvasReady?.(canvasRef.current);
    return () => onCanvasReady?.(null);
  }, [onCanvasReady]);

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      imageElRef.current = img;
      onSourceChange('image');
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover ${source === 'idle' ? 'hidden' : ''}`}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChosen}
      />

      {source === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center font-mono text-white">
          <p className="max-w-xs text-sm text-white/70">
            Activate your camera or upload a picture to create a shareable image
          </p>
          <button
            onClick={() => onSourceChange('camera')}
            className="w-56 bg-chat px-4 py-2 text-xs tracking-wide text-white hover:brightness-110"
          >
            Activate device camera
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-56 bg-chat px-4 py-2 text-xs tracking-wide text-white hover:brightness-110"
          >
            Upload an image
          </button>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 px-8 text-center font-mono text-sm text-white">
          {error}
        </div>
      )}

      {source !== 'idle' && (
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button
            onClick={() => onSourceChange('idle')}
            data-html2canvas-ignore
            className="border border-white/30 bg-black/50 px-2 py-1 font-mono text-[10px] text-white/70 hover:border-white hover:text-white"
          >
            CHANGE SOURCE
          </button>
        </div>
      )}

      {source !== 'idle' && (
        <button
          onClick={onCapture}
          className="absolute bottom-4 right-4 z-20 border border-white/40 bg-black/60 px-3 py-1.5 font-mono text-xs text-white hover:bg-white hover:text-black transition-colors"
        >
          CAPTURE
        </button>
      )}
    </div>
  );
};

export default Stage;
