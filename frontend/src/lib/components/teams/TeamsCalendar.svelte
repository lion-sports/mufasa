<script lang="ts" context="module">
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'
	import { onMount } from 'svelte'
	import EventsService from '$lib/services/events/events.service'
	import EventsViewer from '$lib/components/events/EventsViewer.svelte'

	export let team: Team,
		teammate: Teammate | undefined = undefined,
		selectedDate: Date = new Date(),
		selectedEvents: Event[] = [],
		visibleMonth: number = DateTime.now().get('month') - 1,
		visibleYear: number = DateTime.now().get('year'),
		events: Event[] = [],
    canCreate: boolean = false

	function loadEvents() {
		let service = new EventsService({ fetch })
		service
			.list({
				filters: {
					from: DateTime.now()
						.set({
							month: visibleMonth + 1,
							year: visibleYear
						})
						.startOf('month')
						.startOf('day')
						.startOf('hour')
						.startOf('minute')
						.startOf('millisecond')
						.minus({ days: 7 })
						.toJSDate(),
					to: DateTime.now()
						.set({
							month: visibleMonth + 1,
							year: visibleYear
						})
						.endOf('month')
						.endOf('day')
						.endOf('hour')
						.endOf('minute')
						.endOf('millisecond')
						.plus({ days: 7 })
						.toJSDate(),
					team: {
						id: team.id
					}
				}
			})
			.then((loadedEvents) => {
				events = loadedEvents
			})
	}
</script>

<EventsViewer
	bind:events
	bind:selectedDate
	bind:team
	bind:teammate
	bind:selectedEvents
	bind:visibleMonth
	bind:visibleYear
  bind:canCreate
	on:nextMonth={loadEvents}
	on:previousMonth={loadEvents}
/>
