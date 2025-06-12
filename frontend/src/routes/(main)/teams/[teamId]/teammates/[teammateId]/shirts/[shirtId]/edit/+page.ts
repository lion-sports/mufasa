import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import ShirtService from '$lib/services/shirts/shirts.service'

export const load = (async ({ parent, params, fetch }) => {
	let parentData = await parent()

	if (!parentData.groupedPermissions.shirt.update) throw error(400, 'cannot update a shirt')

	let shirtService = new ShirtService({ fetch, token: parentData.token })
	let shirt = await shirtService.show({ id: Number(params.shirtId) })

	return {
		shirt
	}
}) satisfies PageLoad
