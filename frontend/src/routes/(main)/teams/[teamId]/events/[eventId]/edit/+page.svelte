<script lang="ts" module>
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import EventsService from '$lib/services/events/events.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import EventForm from '$lib/components/events/EventForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let event: Event | undefined = $state()

	onMount(async () => {
		let service = new EventsService({ fetch })
		event = await service.show({ id: parseInt($page.params.eventId) })
	})

	let loading = $state(false)
	function handleConfirmClick() {
		if (!event) return
		loading = true

		let service = new EventsService({ fetch })
		service.update(event).then(() => {
			loading = false
			window.history.back()
		})
	}

	function handleCancelClick() {
		window.history.back()
	}

	function handleOptionClick(customEvent: any) {
		if (customEvent.detail?.element?.name == 'save') {
			handleConfirmClick()
		} else if (customEvent.detail?.element?.name == 'delete' && !!event) {
			let service = new EventsService({ fetch })
			service.destroy(event).then(() => {
				window.history.back()
			})
		}
	}
</script>

{#if data.groupedPermissions.event.update}
	<PageTitle title={event?.name || ''} prependVisible={true}>
		{#snippet append()}
			<OptionMenu
				options={[
					{
						name: 'save',
						title: 'Salva',
						icon: 'mdi-floppy'
					},
					{
						name: 'delete',
						title: 'Elimina',
						icon: 'mdi-delete',
						style: {
							color: '#ad0000'
						}
					}
				]}
				onselect={(e) => handleOptionClick(e)}
			/>
		{/snippet}
	</PageTitle>

	{#if !!event}
		<div style:margin-top="20px">
			<EventForm mode="update" bind:event />
			<ConfirmOrCancelButtons
				on:confirm-click={handleConfirmClick}
				on:cancel-click={handleCancelClick}
				{loading}
			/>
		</div>
	{:else}
		no event
	{/if}
{:else}
	Non puoi visualizzare questa pagina :(
{/if}
