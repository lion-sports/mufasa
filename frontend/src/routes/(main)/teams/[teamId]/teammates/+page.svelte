<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'
	import TeamsService from '$lib/services/teams/teams.service'
  import TeammatesList from '$lib/components/teammates/TeammatesList.svelte'
	import type { PageData } from './$types'
  import user from '$lib/stores/auth/user'

  export let data: PageData

	async function handleTeammatesDestroy() {
		let service = new TeamsService({ fetch })
		if (!!$team && !!$team.id) {
			$team = await service.show({ id: $team.id })
		}
	}

  // TODO verticale per Gabbo, rimuovere quando abbiamo aggiunto il permesso 
  // di vedere gli altri membri del team
  $: filteredTeammates = $team?.teammates.filter((t) => {
    return t.user.email !== 'alessandro.carini28@outlook.com' || (
      !!$team?.owner?.id && !!$user?.id && $team?.owner?.id == $user?.id
    )
  })
</script>

<div style:margin-top="20px">
	{#if !!$team}
		<TeammatesList
			searchable={true}
			teammates={filteredTeammates}
			team={$team}
			on:destroy={handleTeammatesDestroy}
      canInvite={data.groupedPermissions.team.invite}
      canRemoveTeammate={data.groupedPermissions.team.removeUser}
      canUpdateTeam={data.groupedPermissions.team.update}
		/>
	{/if}
</div>
