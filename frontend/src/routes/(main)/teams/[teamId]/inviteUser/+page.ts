import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load = (async ({ parent }) => {
	let parentData = await parent()

	if (!parentData.groupedPermissions.team.invite) throw error(400, 'cannot invite to team')
	return {}
}) satisfies PageLoad
