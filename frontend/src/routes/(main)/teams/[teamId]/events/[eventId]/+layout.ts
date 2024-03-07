import EventsService from '$lib/services/events/events.service'
import type { LayoutLoad } from './$types'
import eventShow from '$lib/stores/events/eventShow'

export const load = (async ({ params, fetch, parent }) => {
	let parentData = await parent()

	let eventService = new EventsService({ fetch, token: parentData.token })
	let event = await eventService.show({ id: Number(params.eventId) })

	eventShow.set(event)

	return {
		event
	}
}) satisfies LayoutLoad
