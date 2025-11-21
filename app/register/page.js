'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: 10, background: '#2563eb', color: '#fff', border: 'none' }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      {(error || localError) && <p style={{ color: 'red' }}>{localError || error}</p>}
      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
