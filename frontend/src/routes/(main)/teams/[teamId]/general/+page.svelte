<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'

	import TeamsGeneral from '$lib/components/teams/TeamsGeneral.svelte'
</script>

{#if !!$team}
	<TeamsGeneral team={$team} />
{/if}
