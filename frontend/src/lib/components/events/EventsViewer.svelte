<script lang="ts" context="module">
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'

	export let team: Team | undefined = undefined,
		teammate: Teammate | undefined = undefined,
		selectedDate: Date = new Date(),
		selectedEvents: Event[] = [],
		events: Event[],
		visibleMonth: number = DateTime.now().get('month') - 1,
		visibleYear: number = DateTime.now().get('year'),
    canCreate: boolean = false

	import EventsCalendar from '$lib/components/events/EventsCalendar.svelte'
</script>

<div style:width="100%">
	<EventsCalendar
		bind:team
		bind:teammate
		bind:selectedDate
		bind:selectedEvents
		bind:events
		bind:visibleMonth
		bind:visibleYear
    bind:canCreate
		on:nextMonth
		on:previousMonth
	/>
</div>
