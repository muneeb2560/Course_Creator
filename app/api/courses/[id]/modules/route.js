import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserFromRequest } from '@/lib/apiAuth';
import { getCreatorOrError } from '@/lib/creatorHelpers';

const moduleSchema = z.object({
  title: z.string().min(3).max(200),
  order_index: z.number().int().nonnegative().optional(),
});

async function verifyCourseOwnership(supabase, creatorId, courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('creator_id', creatorId)
    .maybeSingle();
  if (error) {
    console.error(error);
    return { error: { message: 'Failed to validate course' }, status: 500 };
  }
  if (!data) return { error: { message: 'Course not found' }, status: 404 };
  return { course: data };
}

export async function GET(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const validation = await verifyCourseOwnership(supabase, creatorCheck.creator.id, params.id);
  if (validation.error) return NextResponse.json(validation.error, { status: validation.status });

  const { data, error: queryError } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', params.id)
    .order('order_index', { ascending: true });

  if (queryError) {
    console.error(queryError);
    return NextResponse.json({ message: 'Failed to fetch modules' }, { status: 500 });
  }

  return NextResponse.json({ modules: data });
}

export async function POST(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const validation = await verifyCourseOwnership(supabase, creatorCheck.creator.id, params.id);
  if (validation.error) return NextResponse.json(validation.error, { status: validation.status });

  const json = await request.json().catch(() => null);
  const parsed = moduleSchema.safeParse(json || {});
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  let orderIndex = parsed.data.order_index;
  if (orderIndex === undefined) {
    const { data: maxRow } = await supabase
      .from('modules')
      .select('order_index')
      .eq('course_id', params.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    orderIndex = maxRow?.order_index != null ? maxRow.order_index + 1 : 0;
  }

  const { data, error: insertError } = await supabase
    .from('modules')
    .insert({ title: parsed.data.title, course_id: params.id, order_index: orderIndex })
    .select('*')
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ message: 'Failed to create module' }, { status: 500 });
  }

  return NextResponse.json({ module: data }, { status: 201 });
}
