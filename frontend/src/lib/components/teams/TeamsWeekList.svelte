<script lang="ts" module>
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { run } from 'svelte/legacy'

	import { DateTime } from 'luxon'
	import EventsService from '$lib/services/events/events.service'
	import { createEventDispatcher, onMount } from 'svelte'
	import EventsWeekList from '../events/EventsWeekList.svelte'
	import { Icon } from '@likable-hair/svelte'
	import TeamImportWeekDialog from '$lib/components/teams/TeamImportWeekDialog.svelte'

	let dispatch = createEventDispatcher<{
		focusToday: {
			visibleYear: number
			visibleWeek: number
		}
	}>()

	interface Props {
		team: Team
		teammate?: Teammate | undefined
		selectedDate?: Date
		selectedEvents?: Event[]
		visibleYear?: number
		visibleWeek?: number
		events?: Event[]
		reloadEvents?: boolean
		canUpdate?: boolean
		canDestroy?: boolean
		canCreate?: boolean
	}

	let {
		team = $bindable(),
		teammate = $bindable(undefined),
		selectedDate = $bindable(new Date()),
		selectedEvents = $bindable([]),
		visibleYear = $bindable(),
		visibleWeek = $bindable(),
		events = $bindable([]),
		reloadEvents = $bindable(false),
		canUpdate = $bindable(false),
		canDestroy = $bindable(false),
		canCreate = $bindable(false)
	}: Props = $props()

  let mounted = $state(false)
  onMount(() => {
    mounted = true
  })

	let importFromYear = $state(visibleYear),
		importFromWeek = $state(visibleWeek)

	async function loadEvents(vw: number | undefined, vy: number | undefined) {
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

	let openImportWeekDialog: boolean = $state(false)
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

	run(() => {
		if (reloadEvents && mounted) {
			loadEvents(visibleWeek, visibleYear)
			reloadEvents = false
		}
	})
</script>

{#if !!events}
	<EventsWeekList
		bind:events
		bind:selectedDate
		{team}
		{teammate}
		bind:selectedEvents
		bind:visibleYear
		bind:visibleWeek
		{canUpdate}
		{canDestroy}
		{canCreate}
		on:nextWeek={() => loadEvents(visibleWeek, visibleYear)}
		on:nextWeek
		on:previousWeek={() => loadEvents(visibleWeek, visibleYear)}
		on:previousWeek
	>
		{#snippet weekListOptions()}
			<div style:display="flex" style:gap="15px">
				<div>
					<Icon name="mdi-calendar-today" onclick={focusToday} />
				</div>
			</div>
		{/snippet}
	</EventsWeekList>

  {#if visibleYear !== undefined && visibleWeek !== undefined && importFromWeek !== undefined}
    <TeamImportWeekDialog
      bind:open={openImportWeekDialog}
      {team}
      bind:selectedYear={importFromYear}
      bind:selectedWeek={importFromWeek}
      bind:toYear={visibleYear}
      bind:toWeek={visibleWeek}
      on:import={() => loadEvents(visibleWeek, visibleYear)}
    />
  {/if}
{/if}
