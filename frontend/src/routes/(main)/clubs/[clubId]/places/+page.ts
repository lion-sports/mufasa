import PlaceService from '@/lib/services/places/places.service';
import type { PageLoad } from './$types';
import { FilterBuilder } from '@likable-hair/svelte';

export const load = (async ({ fetch, parent }) => {
  let parentData = await parent()

  let builder = new FilterBuilder()
  builder.where('clubId', parentData.club.id)

  let service = new PlaceService({ fetch, token: parentData.token })
  let paginatedPlaces = await service.list({ 
    page: 1,
    perPage: 100,
    filtersBuilder: builder
  })

  return {
    paginatedPlaces
  };
}) satisfies PageLoad;