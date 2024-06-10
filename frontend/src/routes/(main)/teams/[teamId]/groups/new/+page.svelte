<script lang="ts">
	import GroupsService from '$lib/services/groups/groups.service'
	import { page } from '$app/stores'
	import { goto, invalidate } from '$app/navigation'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import RoleForm from '$lib/components/groups/GroupForm.svelte'
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
		let service = new GroupsService({ fetch })
		loading = true
		await service.create(role)

		loading = false
    await invalidate('teams:[teamId]')
		goto(`/teams/${role.team.id}/groups`)
	}

	function handleCancel() {
		goto(`/teams/${role.team.id}/groups`)
	}
</script>

<PageTitle title="Nuovo gruppo" prependVisible={true} />

<div style:margin-top="20px">
  <RoleForm group={role} />
  <ConfirmOrCancelButtons
    on:cancel-click={handleCancel}
    on:confirm-click={handleSubmit}
    {loading}
  />
</div>
