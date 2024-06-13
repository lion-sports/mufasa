import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  let parentData = await parent()

  if (!parentData.groupedPermissions.group.view) throw error(400, 'cannot view groups')
  return {};
}) satisfies PageLoad;