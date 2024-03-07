import type { PageLoad } from './$types'
import TeamsService from '$lib/services/teams/teams.service'
import InvitationsService from '$lib/services/invitations/invitations.service'

export const load = (async ({ fetch, parent }) => {
	const parentData = await parent()

	let teamsService = new TeamsService({ fetch, token: parentData.token })
	let paginatedTeams = await teamsService.list()

	return {
		teams: paginatedTeams.data
	}
}) satisfies PageLoad
