import ScoutsService from '$lib/services/scouts/scouts.service'
import DashboardService from '@/lib/services/dashboards/dashboard.service'
import type { PageLoad } from './$types'
import { FilterBuilder } from '@likable-hair/svelte'

export const load = (async ({ fetch, params, parent }) => {
	let parentData = await parent()

	let scoutService = new ScoutsService({ fetch, token: parentData.token })
	let studio = await scoutService.studio({ id: Number(params.scoutId) })

	let service = new DashboardService({ fetch, token: parentData.token })
	let paginatedDashboards = await service.list({
		page: 1,
		perPage: 1,
		filtersBuilder: new FilterBuilder().where('active', true)
	})

	return {
		studio,
		dashboard: paginatedDashboards.data[0]
	}
}) satisfies PageLoad
