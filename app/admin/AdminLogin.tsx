'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/admin/actions';

export const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await login(password);
    if (!res.ok) {
      setError(res.error ?? 'Login failed.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-mono text-white">
      <form
        onSubmit={handleSubmit}
        className="w-72 space-y-3 border border-white/30 p-6"
      >
        <h1 className="text-sm tracking-widest text-white/70">GIRLSET ADMIN</h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="password"
          className="w-full border border-white/30 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-white"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full border border-white py-1.5 text-xs tracking-widest hover:bg-white hover:text-black"
        >
          ENTER
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;