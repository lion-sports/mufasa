import ScoringSystemsService from '$lib/services/scoringSystems/scoringSystems.service';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  let parentData = await parent()
  
  let service = new ScoringSystemsService({ fetch, token: parentData.token })
  let paginatedScoringSystems = await service.list()

  return {
    paginatedScoringSystems
  };
}) satisfies PageLoad;