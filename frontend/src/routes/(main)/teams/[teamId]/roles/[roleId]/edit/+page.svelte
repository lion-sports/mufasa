<script lang="ts" context="module">
	import type { Role } from '$lib/services/roles/roles.service'
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import RoleService from '$lib/services/roles/roles.service'
	import CansService from '$lib/services/roles/cans.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import RoleForm from '$lib/components/roles/RoleForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'

	let role: Role
	onMount(async () => {
		let service = new RoleService({ fetch })
		role = await service.show({ id: parseInt($page.params.roleId) })
	})

	let loading = false
	function handleConfirmClick() {
		loading = true

		let service = new RoleService({ fetch })
		service.update(role).then(() => {
			loading = false
			window.history.back()
		})
	}

	function handleCancelClick() {
		window.history.back()
	}
</script>

{#if CansService.can('Role', 'update')}
	<PageTitle title={role?.name || ''} prependVisible={true} />

	{#if !!role}
		<div style:margin-top="20px">
			<RoleForm mode="update" {role} />
			<ConfirmOrCancelButtons
				on:confirm-click={handleConfirmClick}
				on:cancel-click={handleCancelClick}
				{loading}
			/>
		</div>
	{:else}
		no team
	{/if}
{:else}
	Non puoi accedere a questa pagina :(
{/if}
