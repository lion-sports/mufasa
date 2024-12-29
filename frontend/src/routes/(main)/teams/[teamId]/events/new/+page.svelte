<script lang="ts">
	import type { Event } from '$lib/components/events/EventForm.svelte'
	import { page } from '$app/stores'
	import EventService from '$lib/services/events/events.service'
	import team from '$lib/stores/teams/teamsShow'
	import { onMount } from 'svelte'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import EventForm from '$lib/components/events/EventForm.svelte'
	import { DateTime } from 'luxon'
	import type { PageData } from './$types'

	export let data: PageData

	let event: Event = {},
		loading: boolean = false,
		convocations: { [key: number]: boolean } = {}

	onMount(async () => {
		let startParams: string | null = $page.url.searchParams.get('start')
		if (!!startParams) {
      if(!event) event = {}
      event.start = DateTime.fromISO(startParams).toJSDate()
		}

    let endParams: string | null = $page.url.searchParams.get('end')
    if (!!endParams) {
      if(!event) event = {}
      event.end = DateTime.fromISO(endParams).toJSDate()
		}
	})

	function handleSubmit() {
		let formattedConvocations: { teammateId: number }[] = []
		for (let [key, value] of Object.entries(convocations)) {
			if (value) {
				formattedConvocations.push({
					teammateId: parseInt(key)
				})
			}
		}

		loading = true
		let service = new EventService({ fetch })
		if (!!event.start && !!event.end && !!event.name) {
			service
				.create({
					start: event.start,
					end: event.end,
					name: event.name,
					description: event.description,
					team: {
						id: parseInt($page.params.teamId)
					},
					convocations: formattedConvocations
				})
				.then(() => {
					loading = false
					window.history.back()
				})
		} else {
			console.log('incomplete event')
		}
	}

	$: {
		let startParams: string | null = $page.url.searchParams.get('start')
		if (!!startParams && !event.start) {
			event.start = DateTime.fromISO(startParams).toJSDate()
		}
	}

	$: confirmDisabled = !event || !event.start || !event.end || !event.name

	function handleCancel() {
		window.history.back()
	}
</script>


<PageTitle title="Nuovo evento" prependVisible={true} />

<div style:margin-top="20px">
  <EventForm bind:event teammates={$team?.teammates} bind:convocations groups={$team?.groups} />
  <ConfirmOrCancelButtons
    confirmDisable={confirmDisabled}
    {loading}
    on:confirm-click={handleSubmit}
    on:cancel-click={handleCancel}
  />
</div>
