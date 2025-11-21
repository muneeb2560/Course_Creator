'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useRequireAuth from '@/hooks/useRequireAuth';

export default function EditCoursePage() {
  const { id } = useParams();
  const { user, loading } = useRequireAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!user || !id) return;
      setFetching(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to load course');
        }
        const data = await res.json();
        setCourse(data.course);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    loadCourse();
  }, [user, id]);

  if (loading || fetching) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!course) return <p>No course found.</p>;

  return (
    <div>
      <h1>Edit Course</h1>
      <p>Title: {course.title}</p>
      <p>Status: {course.is_published ? 'Published' : 'Draft'}</p>
      <p>Modules and lessons will be managed in Phase 3.</p>
    </div>
  );
}
