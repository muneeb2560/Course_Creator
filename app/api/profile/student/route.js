import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/apiAuth';
import { z } from 'zod';

const bodySchema = z.object({
  display_name: z.string().min(2).max(120),
});

export async function POST(request) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json || {});
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const { data: existing } = await supabase.from('students').select('*').eq('id', user.id).maybeSingle();
  if (existing) {
    return NextResponse.json({ student: existing });
  }

  const { data, error: insertError } = await supabase
    .from('students')
    .insert({ id: user.id, display_name: parsed.data.display_name })
    .select('*')
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ message: 'Failed to create student profile' }, { status: 500 });
  }

  return NextResponse.json({ student: data });
}
