import type { PageLoad } from './$types'
import EventsService from '$lib/services/events/events.service'
import { DateTime } from 'luxon'

export const load = (async ({ parent, fetch, params }) => {
	const parentData = await parent()

	let eventsService = new EventsService({ fetch, token: parentData.token })
	let events = await eventsService.list({
		filters: {
			from: DateTime.now().startOf('month').toJSDate(),
			to: DateTime.now().endOf('month').toJSDate(),
			team: parentData.team
		}
	})

	return {
		events
	}
}) satisfies PageLoad
