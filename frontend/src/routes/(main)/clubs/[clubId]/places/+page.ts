import PlaceService from '@/lib/services/places/places.service';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, parent }) => {
  let parentData = await parent()

  let service = new PlaceService({ fetch, token: parentData.token })
  let paginatedPlaces = await service.list({ 
    page: 1,
    perPage: 100
  })

  return {
    paginatedPlaces
  };
}) satisfies PageLoad;