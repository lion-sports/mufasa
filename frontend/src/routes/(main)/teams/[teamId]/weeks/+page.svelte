<script lang="ts">
	import TeamsWeekList from '$lib/components/teams/TeamsWeekList.svelte'
	import team from '$lib/stores/teams/teamsShow'
	import teammate from '$lib/stores/teams/teamsTeammate'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	let visibleWeek: number, visibleYear: number, reloadEvents: boolean

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
		localStorage.setItem('teams:weeks:visibleYear', visibleYear.toString())
		localStorage.setItem('teams:weeks:visibleWeek', visibleWeek.toString())
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
		on:nextWeek={handleWeekChange}
		on:previousWeek={handleWeekChange}
		on:focusToday={handleWeekChange}
	/>
{/if}
