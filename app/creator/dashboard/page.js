'use client';

import { useEffect, useState } from 'react';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function CreatorDashboardPage() {
  const { user, loading } = useRequireAuth();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to load courses');
        }
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    loadCourses();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Redirecting...</p>;

  return (
    <div>
      <h1>Creator Dashboard</h1>
      <a href="/creator/courses/new">Create new course</a>
      {fetching && <p>Loading courses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.title} – {course.is_published ? 'Published' : 'Draft'}
          </li>
        ))}
      </ul>
    </div>
  );
}
