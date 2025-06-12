<script lang="ts">
	import { invalidate } from '$app/navigation'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ShirtsForm from '$lib/components/shirts/ShirtsForm.svelte'
	import ShirtService from '$lib/services/shirts/shirts.service'
	import TeammatesService from '$lib/services/teammates/teammates.service'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data = $bindable() }: Props = $props()

	let loading: boolean = false

	async function handleSubmit() {
		loading = true
		let shirtService = new ShirtService({ fetch })
		await shirtService.update({
			id: data.shirt.id,
			number: data.shirt.number,
			name: data.shirt.name,
			teammateId: data.shirt.teammateId,
			primaryColor: data.shirt.primaryColor,
			secondaryColor: data.shirt.secondaryColor
		})

		await invalidate('shirts:list')
		loading = false
		window.history.back()
	}
</script>

<PageTitle
	title={data.shirt.number.toString() || data.shirt.name || 'Nuova maglia'}
	prependVisible
	subtitle={TeammatesService.getTeammateName({ teammate: data.teammate })}
></PageTitle>

<ShirtsForm bind:shirt={data.shirt}></ShirtsForm>

<ConfirmOrCancelButtons on:confirm-click={handleSubmit}></ConfirmOrCancelButtons>
