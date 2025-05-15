import { FilterBuilder } from '@likable-hair/svelte';
import type { PageLoad } from './$types';
import GroupsService from '@/lib/services/groups/groups.service';

export const load = (async ({ parent, fetch, depends }) => {
  depends('club:settings:groups')
  let parentData = await parent()

  let builder = new FilterBuilder()
  builder.where('clubId', parentData.club.id)
  
  let groupsService = new GroupsService({ fetch, token: parentData.token })
  let paginatedGroups = await groupsService.list({
    page: 1,
    perPage: 100,
    filtersBuilder: builder
  })

  return {
    paginatedGroups
  };
}) satisfies PageLoad;