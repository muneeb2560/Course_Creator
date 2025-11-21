import './globals.css';
import AuthProvider from '@/contexts/AuthContext';

export const metadata = {
  title: 'Course Creator SaaS',
  description: 'Multi-tenant course platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
              <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a href="/">Home</a>
                <a href="/dashboard">Dashboard</a>
                <a href="/creator/dashboard">Creator</a>
              </nav>
            </header>
            <main style={{ flex: 1, padding: '24px' }}>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
