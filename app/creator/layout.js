import Link from 'next/link';
import '@/app/globals.css';

export default function CreatorLayout({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '70vh', gap: 24 }}>
      <aside style={{ borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
        <h3>Creator</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/creator/dashboard">Dashboard</Link>
          <Link href="/creator/courses/new">New Course</Link>
          <Link href="/creator/onboarding">Onboarding</Link>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
