import type { PageLoad } from './$types'
import EventsService from '$lib/services/events/events.service'
import TeamsService from '$lib/services/teams/teams.service'
import TeammatesService from '$lib/services/teammates/teammates.service'
import { DateTime } from 'luxon'

export const load = (async ({ fetch, parent }) => {
	const parentData = await parent()

	const service = new EventsService({ fetch, token: parentData.token })
	let nextEvents = await service.list({
		filters: {
			from: DateTime.now().toJSDate(),
			to: DateTime.now().plus({ days: 1 }).endOf('day').toJSDate()
		}
	})

	let teamService = new TeamsService({ fetch, token: parentData.token })
	let absencesInLatestEvents = await teamService.absencesInLatestEvents({
		forLastEvents: 10
	})

	let paginatedTeams = await teamService.list()

	let teammateService = new TeammatesService({ fetch, token: parentData.token })
	let mostAbsenceForTeammate = await teammateService.mostAbsenceForTeammates()

	return {
		nextEvents,
		absencesInLatestEvents,
		mostAbsenceForTeammate,
		teams: paginatedTeams.data
	}
}) satisfies PageLoad
