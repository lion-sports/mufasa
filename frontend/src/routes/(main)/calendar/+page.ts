import type { PageLoad } from './$types'
import EventsService from '$lib/services/events/events.service'
import { DateTime } from 'luxon'

export const load = (async ({ fetch, parent }) => {
	const parentData = await parent()

	const service = new EventsService({ fetch, token: parentData.token })
	let events = await service.list({
		filters: {
			from: DateTime.now().startOf('month').toJSDate(),
			to: DateTime.now().endOf('month').toJSDate()
		}
	})

	return {
		events
	}
}) satisfies PageLoad
