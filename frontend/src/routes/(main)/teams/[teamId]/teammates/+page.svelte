<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'
	import TeamsService from '$lib/services/teams/teams.service'

	async function handleTeammatesDestroy() {
		let service = new TeamsService({ fetch })
		if (!!$team && !!$team.id) {
			$team = await service.show({ id: $team.id })
		}
	}

	import TeammatesList from '$lib/components/teammates/TeammatesList.svelte'
</script>

<div style:margin-top="20px">
	{#if !!$team}
		<TeammatesList
			searchable={true}
			teammates={$team.teammates}
			team={$team}
			on:destroy={handleTeammatesDestroy}
		/>
	{/if}
</div>
