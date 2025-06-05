import { FilterBuilder } from '@likable-hair/svelte';
import type { PageLoad } from './$types';
import InvitationsService from '@/lib/services/invitations/invitations.service';

export const load = (async ({ fetch, parent, depends }) => {
  depends('club:settings:invitations')
  let parentData = await parent()

  let builder = new FilterBuilder()
  builder.where('clubId', parentData.club.id)

  let invitationsService = new InvitationsService({ fetch, token: parentData.token })
  let paginatedInvitations = await invitationsService.list({
    page: 1,
    perPage: 100,
    filtersBuilder: builder
  })

  return {
    paginatedInvitations
  };
}) satisfies PageLoad;