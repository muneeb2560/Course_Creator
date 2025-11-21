import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserFromRequest } from '@/lib/apiAuth';
import { getCreatorOrError } from '@/lib/creatorHelpers';

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  is_published: z.boolean().optional(),
});

async function getCourseForCreator(supabase, creatorId, courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('creator_id', creatorId)
    .maybeSingle();
  if (error) {
    console.error(error);
    return { error: { message: 'Failed to fetch course' }, status: 500 };
  }
  if (!data) {
    return { error: { message: 'Course not found' }, status: 404 };
  }
  return { course: data };
}

export async function GET(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const result = await getCourseForCreator(supabase, creatorCheck.creator.id, params.id);
  if (result.error) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json({ course: result.course });
}

export async function PUT(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const existing = await getCourseForCreator(supabase, creatorCheck.creator.id, params.id);
  if (existing.error) return NextResponse.json(existing.error, { status: existing.status });

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json || {});
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from('courses')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single();

  if (updateError) {
    console.error(updateError);
    return NextResponse.json({ message: 'Failed to update course' }, { status: 500 });
  }

  return NextResponse.json({ course: data });
}

export async function DELETE(request, { params }) {
  const { user, supabase, error, status } = await getAuthUserFromRequest(request);
  if (error) return NextResponse.json(error, { status });
  const creatorCheck = await getCreatorOrError(supabase, user.id);
  if (creatorCheck.error) return NextResponse.json(creatorCheck.error, { status: creatorCheck.status });

  const existing = await getCourseForCreator(supabase, creatorCheck.creator.id, params.id);
  if (existing.error) return NextResponse.json(existing.error, { status: existing.status });

  const { error: deleteError } = await supabase.from('courses').delete().eq('id', params.id);
  if (deleteError) {
    console.error(deleteError);
    return NextResponse.json({ message: 'Failed to delete course' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
