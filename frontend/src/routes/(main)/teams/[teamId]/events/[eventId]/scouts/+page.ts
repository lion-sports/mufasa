import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ parent, depends }) => {
  depends('scouts:list')
  let parentData = await parent()

  if(!parentData.groupedPermissions.scout.manage) throw error(401, 'not permitted')

  return {};
}) satisfies PageLoad;