import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load = (async ({ parent }) => {
	let parentData = await parent()

	if (!parentData.groupedPermissions.event.create) throw error(400, 'cannot create events')
	return {}
}) satisfies PageLoad
