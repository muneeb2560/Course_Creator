import { firebaseAuth } from '@/lib/firebaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function getAuthUserFromRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { error: { message: 'Missing Authorization header' }, status: 401 };
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    const supabase = getSupabaseServer();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', decoded.uid)
      .single();

    if (error || !user) {
      return { error: { message: 'User not found' }, status: 401 };
    }

    return { user, supabase };
  } catch (err) {
    console.error('Auth verification failed', err);
    return { error: { message: 'Invalid token' }, status: 401 };
  }
}
