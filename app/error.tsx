'use client';

import { useEffect } from 'react';

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black font-mono text-white gap-4">
      <p className="text-xs text-white/50 tracking-widest">
        something went wrong
      </p>
      <button
        onClick={reset}
        className="border border-white/30 px-4 py-2 text-xs hover:border-white"
      >
        try again
      </button>
    </div>
  );
};

export default Error;
