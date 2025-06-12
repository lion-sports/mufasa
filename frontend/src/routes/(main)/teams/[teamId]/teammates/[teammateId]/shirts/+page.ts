import ShirtService from '$lib/services/shirts/shirts.service'
import { FilterBuilder } from '@likable-hair/svelte'
import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load = (async ({ parent, fetch, params, depends }) => {
	depends('shirts:list')
	let parentData = await parent()

	if (!parentData.groupedPermissions.shirt.view) throw error(400, 'cannot view shirts')

	let filtersBuilder = new FilterBuilder()
	filtersBuilder.where('teammateId', params.teammateId)

	let shirtService = new ShirtService({ fetch, token: parentData.token })
	let paginatedShirts = await shirtService.list({
		page: 1,
		perPage: 20,
		filtersBuilder
	})

	return {
		paginatedShirts
	}
}) satisfies PageLoad
