import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, params }) => {
  let parentData = await parent()

  let teammate = parentData.team.teammates.find((tm) => tm.id == Number(params.teammateId))
  if (!teammate) throw error(404, 'Cannot find the teammate')

  return {
    teammate
  }
}) satisfies LayoutLoad;