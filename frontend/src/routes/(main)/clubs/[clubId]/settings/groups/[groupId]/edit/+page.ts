import GroupsService from '@/lib/services/groups/groups.service';
import type { PageLoad } from './$types';

export const load = (async ({ depends, fetch, parent, params }) => {
  depends('club:settings:groups')
  let parentData = await parent()

  let service = new GroupsService({ fetch, token: parentData.token })
  let group = await service.show({
    id: Number(params.groupId)
  })

  return {
    group
  };
}) satisfies PageLoad;