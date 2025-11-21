import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/apiAuth';
import { z } from 'zod';

const bodySchema = z.object({
  display_name: z.string().min(2).max(120),
  bio: z.string().max(500).optional(),
});

export async function POST(request) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json || {});
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const { data: existing } = await supabase.from('creators').select('*').eq('id', user.id).maybeSingle();
  if (existing) {
    return NextResponse.json({ creator: existing });
  }

  const { data, error: insertError } = await supabase
    .from('creators')
    .insert({ id: user.id, display_name: parsed.data.display_name, bio: parsed.data.bio || null })
    .select('*')
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ message: 'Failed to create creator profile' }, { status: 500 });
  }

  return NextResponse.json({ creator: data });
}
