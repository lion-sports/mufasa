<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'
	import teammate from '$lib/stores/teams/teamsTeammate'
	import TeamsCalendarWithSidebar from '$lib/components/teams/TeamsCalendarWithSidebar.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

{#if !!$team}
	<TeamsCalendarWithSidebar team={$team} teammate={$teammate} events={data.events} />
{/if}
