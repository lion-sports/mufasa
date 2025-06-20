import ClubsService from '@/lib/services/clubs/clubs.service';
import type { PageLoad } from './$types';

export const load = (async ({ fetch, params }) => {
  let service = new ClubsService({ fetch })

  let club = await service.getByName({
    name: params.clubName
  })

  return {
    club
  };
}) satisfies PageLoad;