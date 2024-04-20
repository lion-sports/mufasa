import type { LayoutLoad } from './$types'
import TeamsService from '$lib/services/teams/teams.service'

export const load = (async ({ parent, fetch, params, depends }) => {
	depends('teams:[teamId]')
	let parentData = await parent()

	let teamsService = new TeamsService({ fetch, token: parentData.token })
	let team = await teamsService.show({ id: Number(params.teamId) })

	return {
		team
	}
}) satisfies LayoutLoad
