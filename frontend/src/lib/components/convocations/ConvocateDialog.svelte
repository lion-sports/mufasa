<script lang="ts">
	import type { Teammate } from '$lib/services/teams/teams.service'
	import type { Convocation } from '$lib/services/convocations/convocations.service'
	import StandardDialog from '../common/StandardDialog.svelte'
	import TeammatesChecklist from '../teammates/TeammatesChecklist.svelte'
	import ConvocationsService from '$lib/services/convocations/convocations.service'
	import { createEventDispatcher } from 'svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import type { Event } from '$lib/services/events/events.service'

	export let open: boolean = false,
		teammates: Teammate[] = [],
		team: { id: number } | undefined = undefined,
		event: Pick<Event, 'id'>

	let dispatch = createEventDispatcher<{
		convocate: {
			teammates: Pick<Teammate, 'id'>[]
			convocations: Convocation[]
		}
	}>()

	let loading: boolean = false,
		selectedTeammates: { [key: number]: boolean } = {},
		teammatesObjects: { id: number }[] = []
	function convocate() {
		if (cannotConvocate) return
		loading = true

		let service = new ConvocationsService({ fetch })
		service
			.convocate({
				event: {
					id: event.id
				},
				teammates: teammatesObjects
			})
			.then((response) => {
				dispatch('convocate', {
					teammates: teammatesObjects,
					convocations: response
				})
				loading = false
			})
	}

	$: {
		teammatesObjects = []
		for (const [key, value] of Object.entries(selectedTeammates)) {
			if (value) {
				teammatesObjects.push({
					id: parseInt(key)
				})
			}
		}
	}
	$: cannotConvocate = teammatesObjects.length == 0
</script>

<StandardDialog bind:open title="Convoca">
	<div style:margin-bottom="15px">
		<TeammatesChecklist {teammates} bind:value={selectedTeammates} bind:team groupFilter={true} />
	</div>
	<StandardButton on:click={convocate} {loading} disabled={cannotConvocate}>Convoca</StandardButton>
</StandardDialog>
