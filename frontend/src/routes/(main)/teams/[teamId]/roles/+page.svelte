<script lang="ts">
	import team from '$lib/stores/teams/teamsShow'
	import RolesService from '$lib/services/roles/roles.service'
	import CansService from '$lib/services/roles/cans.service'

	async function handleRoleDestroy() {
		if (!!$team) {
			let service = new RolesService({ fetch })
			let response = await service.list({ team: $team })
			$team.roles = response.data
		}
	}

	import RolesList from '$lib/components/roles/RolesList.svelte'
</script>

{#if CansService.can('Role', 'update')}
	{#if !!$team}
		<RolesList team={$team} searchable={true} roles={$team.roles} on:destroy={handleRoleDestroy} />
	{/if}
{:else}
	Non puoi accedere a questa pagina :(
{/if}
