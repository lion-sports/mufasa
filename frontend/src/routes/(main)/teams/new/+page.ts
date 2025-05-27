import ClubsService, { type Club } from '@/lib/services/clubs/clubs.service';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, parent, url }) => {
  let parentData = await parent()

  let clubId = url.searchParams.get('clubId')

  let service = new ClubsService({ fetch, token: parentData.token })
  let paginatedClubs = await service.mine({
    page: 1,
    perPage: 100
  })

  let selectedClub: Club | undefined = undefined
  if(!!clubId) {
    selectedClub = paginatedClubs.data.find((e) => e.id == Number(clubId))
  }

  return {
    paginatedClubs,
    selectedClub
  };
}) satisfies PageLoad;