<script lang="ts" context="module">
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'
	import EventsService from '$lib/services/events/events.service'
	import { createEventDispatcher } from 'svelte'
	import EventsWeekList from '../events/EventsWeekList.svelte'
	import { Icon } from '@likable-hair/svelte'
	import TeamImportWeekDialog from '$lib/components/teams/TeamImportWeekDialog.svelte'

	let dispatch = createEventDispatcher<{
		focusToday: {
			visibleYear: number
			visibleWeek: number
		}
	}>()

	export let team: Team,
		teammate: Teammate | undefined = undefined,
		selectedDate: Date = new Date(),
		selectedEvents: Event[] = [],
		visibleYear: number = DateTime.now().get('year'),
		visibleWeek: number = DateTime.now().get('weekNumber'),
		events: Event[] = [],
    reloadEvents: boolean = false

	let importFromYear = visibleYear,
		importFromWeek = visibleWeek

	async function loadEvents(vw: number, vy: number) {
		let from: Date = DateTime.fromObject({
				weekday: 1,
				weekNumber: vw,
				weekYear: vy
			})
				.startOf('day')
				.startOf('hour')
				.startOf('minute')
				.startOf('millisecond')
				.toJSDate(),
			to: Date = DateTime.fromObject({
				weekday: 7,
				weekNumber: vw,
				weekYear: vy
			})
				.endOf('day')
				.endOf('hour')
				.endOf('minute')
				.endOf('millisecond')
				.toJSDate()

		let service = new EventsService({ fetch })
		let newEvents = await service.list({
			filters: {
				from: from,
				to: to,
				team: {
					id: team.id
				}
			}
		})

		events = !!events
			? events.filter((e) => {
					return !(e.start > from && e.start < to)
			  })
			: []

		events = [...events, ...newEvents]
	}

	let openImportWeekDialog: boolean = false
	function handleImportWeekClick() {
		openImportWeekDialog = true
	}

	function focusToday() {
		visibleWeek = DateTime.now().get('weekNumber')
		visibleYear = DateTime.now().get('weekYear')
		dispatch('focusToday', {
			visibleWeek: visibleWeek,
			visibleYear: visibleYear
		})
	}

  $: if(reloadEvents) {
    loadEvents(visibleWeek, visibleYear)
    reloadEvents = false
  }
</script>

{#if !!events}
	<EventsWeekList
		bind:events
		bind:selectedDate
		bind:team
		bind:teammate
		bind:selectedEvents
		bind:visibleYear
		bind:visibleWeek
		on:nextWeek={() => loadEvents(visibleWeek, visibleYear)}
		on:nextWeek
		on:previousWeek={() => loadEvents(visibleWeek, visibleYear)}
		on:previousWeek
	>
		<div style:display="flex" style:gap="15px" slot="options">
			<div>
				<Icon name="mdi-calendar-today" click on:click={focusToday} />
			</div>
		</div>
	</EventsWeekList>

	<TeamImportWeekDialog
		bind:open={openImportWeekDialog}
		bind:team
		bind:selectedYear={importFromYear}
		bind:selectedWeek={importFromWeek}
		bind:toYear={visibleYear}
		bind:toWeek={visibleWeek}
		on:import={() => loadEvents(visibleWeek, visibleYear)}
	/>
{/if}
