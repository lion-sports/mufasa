<script lang="ts" context="module">
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'
	import EventsCalendar from '../events/EventsCalendar.svelte'

	export let team: Team,
		selectedDate: Date = new Date(),
		selectedEvents: Event[] = [],
		visibleMonth: number = DateTime.now().get('month') - 1,
		visibleYear: number = DateTime.now().get('year'),
		events: Event[] = [],
    canCreate: boolean = false

  function calculateSelectedEvents() {
    selectedEvents = events.filter((e) => {
      if(!selectedDate) return false
      let startOfDayMillis = DateTime.fromJSDate(selectedDate).startOf('day').toMillis()
      let endOfDayMillis = DateTime.fromJSDate(selectedDate).endOf('day').toMillis()
      let eventMillis = DateTime.fromJSDate(e.start).toMillis()
      return eventMillis < endOfDayMillis && eventMillis >= startOfDayMillis
    })
  }

  $: if(!!selectedDate) calculateSelectedEvents()
    else calculateSelectedEvents()
</script>

<EventsCalendar
	bind:selectedDate
	bind:team
  bind:events
	bind:visibleMonth
	bind:visibleYear
  bind:canCreate
/>
