import ScoringSystemsService from '$lib/services/scoringSystems/scoringSystems.service';
import type { PageLoad } from './$types';

export const load = (async ({ parent, fetch, params }) => {
  let parentData = await parent()

  let service = new ScoringSystemsService({ fetch, token: parentData.token })
  let scoringSystem = await service.show({ id: Number(params.scoringSystemId) })
  return {
    scoringSystem
  };
}) satisfies PageLoad;