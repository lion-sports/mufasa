<script lang="ts">
	import GroupsService from '$lib/services/groups/groups.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import GroupForm from '$lib/components/groups/GroupForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import type { PageData } from './$types'

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let loading = $state(false)
	async function handleConfirmClick() {
		loading = true

		let service = new GroupsService({ fetch })
		await service.update(data.group)
		loading = false
		window.history.back()
	}

	function handleCancelClick() {
		window.history.back()
	}
</script>


<PageTitle title={data.group.name || ''} prependVisible={true} />

<div class="mt-4">
  <GroupForm group={data.group} />
  <ConfirmOrCancelButtons
    on:confirm-click={handleConfirmClick}
    on:cancel-click={handleCancelClick}
    {loading}
  />
</div>
