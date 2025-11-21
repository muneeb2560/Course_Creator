import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/apiAuth';

export async function GET(request) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) {
    return NextResponse.json(error, { status });
  }

  const { data: creator } = await supabase.from('creators').select('*').eq('id', user.id).single();
  const { data: student } = await supabase.from('students').select('*').eq('id', user.id).single();

  return NextResponse.json({ user, creator: creator || null, student: student || null });
}
