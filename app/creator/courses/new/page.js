'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function NewCoursePage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create course');
      }
      const data = await res.json();
      router.push(`/creator/courses/${data.course.id}/edit`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div>
      <h1>New Course</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 8 }} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ padding: 8 }} />
        </label>
        <button type="submit" disabled={submitting} style={{ padding: 10, background: '#2563eb', color: '#fff', border: 'none' }}>
          {submitting ? 'Creating...' : 'Create course'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
