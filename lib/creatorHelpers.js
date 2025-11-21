export async function getCreatorOrError(supabase, userId) {
  const { data: creator, error } = await supabase.from('creators').select('*').eq('id', userId).single();
  if (error || !creator) {
    return { error: { message: 'Creator profile required' }, status: 403 };
  }
  return { creator };
}
