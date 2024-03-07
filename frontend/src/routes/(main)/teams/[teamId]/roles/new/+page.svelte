<script lang="ts">
	import RolesService from '$lib/services/roles/roles.service'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import CansService from '$lib/services/roles/cans.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import RoleForm from '$lib/components/roles/RoleForm.svelte'
	import TeamsService from '$lib/services/teams/teams.service'
	import team from '$lib/stores/teams/teamsShow'

	let role: {
		name?: string
		convocable?: boolean
		team: { id: number }
	} = {
		team: { id: parseInt($page.params.teamId) }
	}

	let loading = false

	async function handleSubmit() {
		let service = new RolesService({ fetch })
		loading = true
		await service.create(role)

		let teamsService = new TeamsService({ fetch })
		$team = await teamsService.show({ id: Number($page.params.teamId) })

		loading = false
		goto(`/teams/${role.team.id}/roles`)
	}

	function handleCancel() {
		goto(`/teams/${role.team.id}/roles`)
	}
</script>

{#if CansService.can('Role', 'update')}
	<PageTitle title="Nuovo ruolo" prependVisible={true} />

	<div style:margin-top="20px">
		<RoleForm {role} />
		<ConfirmOrCancelButtons
			on:cancel-click={handleCancel}
			on:confirm-click={handleSubmit}
			{loading}
		/>
	</div>
{:else}
	Non puoi accedere a questa pagina :(
{/if}
