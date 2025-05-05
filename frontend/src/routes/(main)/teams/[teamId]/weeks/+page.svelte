<script lang="ts">
	import TeamsWeekList from '$lib/components/teams/TeamsWeekList.svelte'
	import team from '$lib/stores/teams/teamsShow'
	import teammate from '$lib/stores/teams/teamsTeammate'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'
	import { DateTime } from 'luxon'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let visibleWeek: number | undefined = $state(DateTime.now().get('weekNumber'))
	let visibleYear: number | undefined = $state(DateTime.now().get('year'))
	let reloadEvents: boolean = $state(true)

	onMount(() => {
		let visibleYearCached = localStorage.getItem('teams:weeks:visibleYear')
		let visibleWeekCached = localStorage.getItem('teams:weeks:visibleWeek')

		if (visibleYearCached !== undefined && visibleYearCached !== null)
			visibleYear = parseInt(visibleYearCached)
		if (visibleWeekCached !== undefined && visibleWeekCached !== null)
			visibleWeek = parseInt(visibleWeekCached)

		reloadEvents = true
	})

	function handleWeekChange(e: CustomEvent<{ visibleYear: number; visibleWeek: number }>) {
		if (visibleYear) localStorage.setItem('teams:weeks:visibleYear', visibleYear.toString())
		if (visibleWeek) localStorage.setItem('teams:weeks:visibleWeek', visibleWeek.toString())
	}
</script>

{#if !!$team}
	<TeamsWeekList
		team={$team}
		teammate={$teammate}
		events={data.events}
		bind:visibleWeek
		bind:visibleYear
		bind:reloadEvents
		canCreate={data.groupedPermissions.event.create}
		canUpdate={data.groupedPermissions.event.update}
		canDestroy={data.groupedPermissions.event.destroy}
		on:nextWeek={handleWeekChange}
		on:previousWeek={handleWeekChange}
		on:focusToday={handleWeekChange}
	/>
{/if}
