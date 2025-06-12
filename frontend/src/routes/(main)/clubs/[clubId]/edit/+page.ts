import ClubsService from '@/lib/services/clubs/clubs.service';
import type { PageLoad } from './$types';

export const load = (async ({ parent, params, fetch }) => {
  let parentData = await parent()
  
  let service = new ClubsService({ fetch, token: parentData.token })
  let club = await service.get({ id: Number(params.clubId) })

  return {
    club
  };
}) satisfies PageLoad;