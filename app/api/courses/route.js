import { NextResponse } from 'next/server';
import { z } from 'zod';
import slugify from 'slugify';
import { getAuthUserFromRequest } from '@/lib/apiAuth';
import { getCreatorOrError } from '@/lib/creatorHelpers';

const courseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
});

async function ensureUniqueSlug(supabase, baseSlug, creatorId) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      throw new Error('Slug lookup failed');
    }
    if (!data) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function GET(request) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });

  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const { data, error: queryError } = await supabase.from('courses').select('*').eq('creator_id', creatorCheck.creator.id);
  if (queryError) {
    console.error(queryError);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }

  return NextResponse.json({ courses: data });
}

export async function POST(request) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });

  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const json = await request.json().catch(() => null);
  const parsed = courseSchema.safeParse(json || {});
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.title, { lower: true, strict: true }) || 'course';
  let slug;
  try {
    slug = await ensureUniqueSlug(supabase, baseSlug, creatorCheck.creator.id);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Failed to generate slug' }, { status: 500 });
  }

  const { data, error: insertError } = await supabase
    .from('courses')
    .insert({
      creator_id: creatorCheck.creator.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      slug,
      is_published: false,
    })
    .select('*')
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ message: 'Failed to create course' }, { status: 500 });
  }

  return NextResponse.json({ course: data }, { status: 201 });
}
