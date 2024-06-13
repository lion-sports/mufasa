import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  let parentData = await parent()

  if(!parentData.groupedPermissions.shirt.create) throw error(400, 'cannot create a shirt')

  return {};
}) satisfies PageLoad;