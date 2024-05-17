import type { PageLoad } from './$types';
import CansService from '$lib/services/groups/cans.service';
import { error } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
  let parentData = await parent()

  if(!CansService.can('Scout', 'manage', parentData.teamCans)) throw error(401, 'not permitted')

  return {};
}) satisfies PageLoad;