import type { PageLoad } from './$types';
import { FilterBuilder } from '@likable-hair/svelte';
import InvitationsService from '@/lib/services/invitations/invitations.service';
import GroupsService from '@/lib/services/groups/groups.service';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params }) => {
  throw redirect(302, `/clubs/${params.clubId}/settings/general`)
}) satisfies PageLoad;