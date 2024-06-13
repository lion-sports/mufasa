<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'
	import TeamsService from '$lib/services/teams/teams.service'

  export let data: PageData

	async function handleTeammatesDestroy() {
		let service = new TeamsService({ fetch })
		if (!!$team && !!$team.id) {
			$team = await service.show({ id: $team.id })
		}
	}

	import TeammatesList from '$lib/components/teammates/TeammatesList.svelte'
	import type { PageData } from './$types'
</script>

<div style:margin-top="20px">
	{#if !!$team}
		<TeammatesList
			searchable={true}
			teammates={$team.teammates}
			team={$team}
			on:destroy={handleTeammatesDestroy}
      canInvite={data.groupedPermissions.team.invite}
      canRemoveTeammate={data.groupedPermissions.team.removeUser}
      canUpdateTeam={data.groupedPermissions.team.update}
		/>
	{/if}
</div>
