import ScoutsService from '$lib/services/scouts/scouts.service';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params, parent }) => {
  let parentData = await parent()

  let scoutService = new ScoutsService({ fetch, token: parentData.token })
  let studio = await scoutService.studio({ id: Number(params.scoutId) })

  return {
    studio
  };
}) satisfies PageLoad;