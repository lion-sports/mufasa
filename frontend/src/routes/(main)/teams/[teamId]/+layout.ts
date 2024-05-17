import type { LayoutLoad } from './$types'
import TeamsService from '$lib/services/teams/teams.service'

export const load = (async ({ parent, fetch, params, depends }) => {
	depends('teams:[teamId]')
	let parentData = await parent()

	let teamsService = new TeamsService({ fetch, token: parentData.token })
	let team = await teamsService.show({ id: Number(params.teamId) })

  let currentTeammate = team.teammates.find((teammate) => {
    return parentData.user && teammate.userId == parentData.user.id
  })

  let teamCans = {
    cans: currentTeammate?.group?.cans,
    owner: !!parentData.user && team.ownerId == parentData.user.id
  }

	return {
		team,
    teamCans
	}
}) satisfies LayoutLoad
