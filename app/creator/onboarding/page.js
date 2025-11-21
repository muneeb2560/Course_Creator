'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function CreatorOnboardingPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/profile/creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create creator profile');
      }
      router.push('/creator/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Creator Onboarding</h1>
      <p>Complete your creator profile to start building courses.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
        <label>
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <button type="submit" disabled={submitting} style={{ padding: 10, background: '#2563eb', color: '#fff', border: 'none' }}>
          {submitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
