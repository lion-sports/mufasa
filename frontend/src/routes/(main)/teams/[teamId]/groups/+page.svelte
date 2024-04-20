<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'
	import GroupsService from '$lib/services/groups/groups.service'
	import CansService from '$lib/services/groups/cans.service'
  import GroupsList from '$lib/components/groups/GroupsList.svelte'

	async function handleGroupDestroy() {
		if (!!$team) {
			let service = new GroupsService({ fetch })
			let response = await service.list({ team: $team })
			$team.groups = response.data
		}
	}
</script>

{#if CansService.can('Group', 'update')}
	{#if !!$team}
		<GroupsList team={$team} searchable={true} groups={$team.groups} on:destroy={handleGroupDestroy} />
	{/if}
{:else}
	Non puoi accedere a questa pagina :(
{/if}