import type { LayoutLoad } from './$types'
import TeamsService from '$lib/services/teams/teams.service'
import GroupsService from '$lib/services/groups/groups.service'
import { error } from '@sveltejs/kit'

export const load = (async ({ parent, fetch, params, depends }) => {
	depends('teams:[teamId]')
	let parentData = await parent()

	let teamsService = new TeamsService({ fetch, token: parentData.token })
	let team = await teamsService.show({ id: Number(params.teamId) })

  let currentTeammate = team.teammates.find((teammate) => {
    return parentData.user && teammate.userId == parentData.user.id
  })

  if(!currentTeammate) throw error(500, 'could not find current teammate')

  const isOwner = !!team.ownerId && team.ownerId == currentTeammate.user.id

  let groupedPermissions = GroupsService.getGroupedPermissions({
    owner: isOwner,
    group: currentTeammate.group
  })

	return {
		team,
    groupedPermissions,
    isOwner
	}
}) satisfies LayoutLoad
