import type { PageLoad } from './$types';
import ClubsService from '$lib/services/clubs/clubs.service'

export const load = (async ({ fetch, parent }) => {
  let parentData = await parent()
  let service = new ClubsService({ fetch, token: parentData.token })

  let paginatedClubs = await service.list({
    page: 1,
    perPage: 100
  })

  return {
    paginatedClubs
  };
}) satisfies PageLoad;