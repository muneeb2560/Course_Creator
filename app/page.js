export default function HomePage() {
  return (
    <div style={{ maxWidth: 800 }}>
      <h1>Course Creator SaaS</h1>
      <p>Build, publish, and deliver courses with Firebase Auth and Supabase.</p>
      <ul>
        <li>Creators can manage courses from the creator dashboard.</li>
        <li>Students will enroll and learn via the student portal.</li>
        <li>Stripe billing and analytics will arrive in later phases.</li>
      </ul>
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    </div>
  );
}
