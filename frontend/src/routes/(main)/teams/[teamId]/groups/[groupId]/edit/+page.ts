import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import GroupsService from '$lib/services/groups/groups.service'

export const load = (async ({ parent, fetch, params }) => {
	let parentData = await parent()

	if (!parentData.groupedPermissions.group.update) throw error(400, 'cannot update group')

	const groupService = new GroupsService({ fetch, token: parentData.token })
	let group = await groupService.show({ id: Number(params.groupId) })

	return {
		group
	}
}) satisfies PageLoad
