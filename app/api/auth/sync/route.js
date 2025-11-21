import { NextResponse } from 'next/server';
import { firebaseAuth } from '@/lib/firebaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ message: 'Missing Authorization header' }, { status: 401 });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('users')
      .upsert(
        { firebase_uid: decoded.uid, email: decoded.email || null },
        { onConflict: 'firebase_uid' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Supabase upsert error', error);
      return NextResponse.json({ message: 'Failed to sync user' }, { status: 500 });
    }

    return NextResponse.json({ user: data }, { status: 200 });
  } catch (err) {
    console.error('Auth sync failed', err);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
