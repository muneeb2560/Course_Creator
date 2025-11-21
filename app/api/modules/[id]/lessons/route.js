import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserFromRequest } from '@/lib/apiAuth';
import { getCreatorOrError } from '@/lib/creatorHelpers';

const lessonSchema = z.object({
  title: z.string().min(3).max(200),
  content_type: z.enum(['video', 'text', 'pdf']),
  content_url: z.string().url().optional(),
  content_body: z.string().optional(),
  order_index: z.number().int().nonnegative().optional(),
});

async function verifyModuleOwnership(supabase, creatorId, moduleId) {
  const { data, error } = await supabase
    .from('modules')
    .select('id, course_id, courses!inner(creator_id)')
    .eq('id', moduleId)
    .single();

  if (error) {
    console.error(error);
    return { error: { message: 'Failed to validate module' }, status: 500 };
  }

  if (!data || data.courses.creator_id !== creatorId) {
    return { error: { message: 'Module not found' }, status: 404 };
  }

  return { module: data };
}

export async function GET(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const validation = await verifyModuleOwnership(supabase, creatorCheck.creator.id, params.id);
  if (validation.error) return NextResponse.json(validation.error, { status: validation.status });

  const { data, error: queryError } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', params.id)
    .order('order_index', { ascending: true });

  if (queryError) {
    console.error(queryError);
    return NextResponse.json({ message: 'Failed to fetch lessons' }, { status: 500 });
  }

  return NextResponse.json({ lessons: data });
}

export async function POST(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const validation = await verifyModuleOwnership(supabase, creatorCheck.creator.id, params.id);
  if (validation.error) return NextResponse.json(validation.error, { status: validation.status });

  const json = await request.json().catch(() => null);
  const parsed = lessonSchema.safeParse(json || {});
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const { content_type, content_url, content_body } = parsed.data;
  if ((content_type === 'video' || content_type === 'pdf') && !content_url) {
    return NextResponse.json({ message: 'content_url is required for video/pdf lessons' }, { status: 400 });
  }
  if (content_type === 'text' && !content_body) {
    return NextResponse.json({ message: 'content_body is required for text lessons' }, { status: 400 });
  }

  let orderIndex = parsed.data.order_index;
  if (orderIndex === undefined) {
    const { data: maxRow } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', params.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    orderIndex = maxRow?.order_index != null ? maxRow.order_index + 1 : 0;
  }

  const { data, error: insertError } = await supabase
    .from('lessons')
    .insert({
      module_id: params.id,
      title: parsed.data.title,
      content_type,
      content_url: content_url || null,
      content_body: content_body || null,
      order_index: orderIndex,
    })
    .select('*')
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ message: 'Failed to create lesson' }, { status: 500 });
  }

  return NextResponse.json({ lesson: data }, { status: 201 });
}
