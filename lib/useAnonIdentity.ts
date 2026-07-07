'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'girlset_anon_number';

export const useAnonIdentity = () => {
  const [anonNumber, setAnonNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) setAnonNumber(Number(cached));
    } catch {}
  }, []);

  const claim = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        setAnonNumber(Number(cached));
        return Number(cached);
      }
    } catch {}
    setLoading(true);
    const { data, error } = await supabase.rpc('claim_anon_number');
    setLoading(false);
    if (!error && typeof data === 'number') {
      try {
        sessionStorage.setItem(STORAGE_KEY, String(data));
      } catch {}
      setAnonNumber(data);
      return data;
    }
    return null;
  }, []);

  return {
    anonNumber,
    displayName: anonNumber !== null ? `anonymous${anonNumber}` : null,
    loading,
    claim
  };
};
