<script lang="ts" context="module">
	import type { Group } from '$lib/services/groups/groups.service'
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import GroupsService from '$lib/services/groups/groups.service'
	import CansService from '$lib/services/groups/cans.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import GroupForm from '$lib/components/groups/GroupForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'

	let group: Group
	onMount(async () => {
		let service = new GroupsService({ fetch })
		group = await service.show({ id: parseInt($page.params.groupId) })
	})

	let loading = false
	function handleConfirmClick() {
		loading = true

		let service = new GroupsService({ fetch })
		service.update(group).then(() => {
			loading = false
			window.history.back()
		})
	}

	function handleCancelClick() {
		window.history.back()
	}
</script>

{#if CansService.can('Group', 'update')}
	<PageTitle title={group?.name || ''} prependVisible={true} />

	{#if !!group}
		<div style:margin-top="20px">
			<GroupForm mode="update" group={group} />
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
