<script lang="ts" context="module">
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import EventsService from '$lib/services/events/events.service'
	import CansService from '$lib/services/groups/cans.service'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import EventForm from '$lib/components/events/EventForm.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'

	let event: Event

	onMount(async () => {
		let service = new EventsService({ fetch })
		event = await service.show({ id: parseInt($page.params.eventId) })
	})

	let loading = false
	function handleConfirmClick() {
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

{#if CansService.can('Event', 'update')}
	<PageTitle title={event?.name || ''} prependVisible={true}>
		<svelte:fragment slot="append">
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
				on:select={handleOptionClick}
			/>
		</svelte:fragment>
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
