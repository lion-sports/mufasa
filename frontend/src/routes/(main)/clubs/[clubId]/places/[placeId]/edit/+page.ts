import PlaceService from '@/lib/services/places/places.service';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch, parent }) => {
  let parentData = await parent()

  let service = new PlaceService({ fetch, token: parentData.token })
  let place = await service.show({ id: Number(params.placeId) })
  
  return {
    place
  };
}) satisfies PageLoad;