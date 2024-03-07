import type { PageLoad } from './$types'
import TeamsService from '$lib/services/teams/teams.service'

export const load = (async ({ fetch, parent, params }) => {
	let parentData = await parent()

	let service = new TeamsService({ fetch, token: parentData.token })
	let team = await service.show({ id: Number(params.teamId) })
	return {
		team
	}
}) satisfies PageLoad
