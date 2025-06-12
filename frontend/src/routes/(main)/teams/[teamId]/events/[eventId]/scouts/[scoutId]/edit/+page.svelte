<script lang="ts">
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ScoutForm from '$lib/components/scouts/ScoutForm.svelte'
	import ScoutsService from '$lib/services/scouts/scouts.service'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data = $bindable() }: Props = $props()

	let loading: boolean = $state(false)

	async function handleSubmit() {
		loading = true

		let service = new ScoutsService({ fetch })
		await service.update({
			...data.scout,
			id: data.scout.id
		})

		window.history.back()
		loading = false
	}
</script>

<PageTitle title={data.scout.name} prependVisible subtitle={data.event.name}></PageTitle>

<ScoutForm bind:scout={data.scout}></ScoutForm>

<ConfirmOrCancelButtons
	{loading}
	on:confirm-click={handleSubmit}
	on:cancel-click={() => window.history.back()}
></ConfirmOrCancelButtons>
