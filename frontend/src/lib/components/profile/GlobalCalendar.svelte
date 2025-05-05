<script lang="ts" module>
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { run } from 'svelte/legacy'

	import { DateTime } from 'luxon'
	import EventsCalendar from '../events/EventsCalendar.svelte'

	interface Props {
		selectedDate?: Date
		selectedEvents?: Event[]
		visibleMonth?: number
		visibleYear?: number
		events: Event[]
		canCreate?: boolean
	}

	let {
		selectedDate = $bindable(),
		selectedEvents = $bindable([]),
		visibleMonth = $bindable(DateTime.now().get('month') - 1),
		visibleYear = $bindable(DateTime.now().get('year')),
		events = $bindable(),
		canCreate = false
	}: Props = $props()

	function calculateSelectedEvents() {
		selectedEvents = events.filter((e) => {
			if (!selectedDate) return false
			let startOfDayMillis = DateTime.fromJSDate(selectedDate).startOf('day').toMillis()
			let endOfDayMillis = DateTime.fromJSDate(selectedDate).endOf('day').toMillis()
			let eventMillis = DateTime.fromJSDate(e.start).toMillis()
			return eventMillis < endOfDayMillis && eventMillis > startOfDayMillis
		})
	}

	run(() => {
		if (!!selectedDate) calculateSelectedEvents()
		else calculateSelectedEvents()
	})
</script>

<EventsCalendar bind:events bind:selectedDate bind:visibleMonth bind:visibleYear {canCreate} />
