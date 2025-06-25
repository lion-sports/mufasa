import ClubsService from '@/lib/services/clubs/clubs.service';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch, params }) => {
  let service = new ClubsService({ fetch })

  let club = await service.getByName({
    name: params.clubName
  })

  return {
    club
  };
}) satisfies LayoutLoad;