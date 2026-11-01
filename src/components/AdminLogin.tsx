'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not sign in.');
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in.');
    } finally { setBusy(false); }
  }

  return <main className="admin-page">
    <header className="admin-header"><a href="/" className="admin-brand">Kush Khurana<span>.</span></a><a href="/" className="admin-back">← View portfolio</a></header>
    <div className="admin-wrap admin-login-wrap">
      <div className="admin-intro"><p className="eyebrow">PRIVATE AREA</p><h1>Welcome<br /><em>back.</em></h1><p>Enter your admin password to manage portfolio content.</p></div>
      <form className="admin-login-form" onSubmit={signIn}>
        <label className="admin-field"><span>Admin password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <p className="admin-login-status" role="status">{status}</p>
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  </main>;
}
