'use client';

import useRequireAuth from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const { profile, logout, error } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Redirecting...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Welcome, {user.email}</p>
      <p>Profile ID: {profile?.id}</p>
      <button onClick={logout} style={{ padding: 10, marginTop: 12 }}>
        Logout
      </button>
    </div>
  );
}
