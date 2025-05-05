<script lang="ts">
	import ConvocateDialog from '$lib/components/convocations/ConvocateDialog.svelte'
	import ConvocationList from '$lib/components/convocations/ConvocationList.svelte'
	import type { Convocation } from '$lib/services/convocations/convocations.service'
	import type { Teammate } from '$lib/services/teams/teams.service'
	import event from '$lib/stores/events/eventShow'
	import team from '$lib/stores/teams/teamsShow'
	import { Icon } from '@likable-hair/svelte'
  import type { PageData } from './$types'

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function handleConfirmOrDeny(e: CustomEvent<{ convocation: Convocation }>) {
		if (!!$event) {
			let index = $event.convocations.findIndex((el) => el.id == e.detail.convocation.id)
			if (index != -1) {
				$event.convocations[index].confirmationStatus = e.detail.convocation.confirmationStatus
			}
		}
	}

	let convocationDialogOpen: boolean = $state(false)
	function openDialog() {
		convocationDialogOpen = true
	}

	function handleConvocate(
		e: CustomEvent<{
			convocations: Convocation[]
			teammates: Pick<Teammate, 'id'>[]
		}>
	) {
		if (!!$event) {
			$event.convocations = [...$event.convocations, ...e.detail.convocations]
		}
		convocationDialogOpen = false
	}

	function handleUnConvocate(
		e: CustomEvent<{
			convocation: Convocation
		}>
	) {
		if (!!$event) {
			$event.convocations = $event.convocations.filter((c) => c.id != e.detail.convocation.id)
		}
	}

	let teammatesToConvocate = $derived(!!$team
		? $team.teammates.filter((tm) => {
				return (
					!!$event &&
					!$event.convocations.map((c) => c.teammateId).includes(tm.id) &&
					(tm.group === undefined || tm.group === null || tm.group?.convocable)
				)
		})
		: [])
</script>

<div style:margin-top="20px">
	<ConvocationList
		convocations={$event?.convocations}
		team={$team}
    canConfirm={data.groupedPermissions.convocation.confirm}
    canDeny={data.groupedPermissions.convocation.deny}
    canConvocate={data.groupedPermissions.event.convocate}
		on:confirm={handleConfirmOrDeny}
		on:deny={handleConfirmOrDeny}
		on:unConvocate={handleUnConvocate}
	/>
</div>

{#if data.groupedPermissions.event.convocate}
	<div
		style:margin-top="20px"
		style:width="100%"
		style:display="flex"
		style:justify-content="center"
	>
		<Icon name="mdi-plus" click on:click={openDialog} />
	</div>
{/if}

{#if !!$event}
	<ConvocateDialog
		bind:open={convocationDialogOpen}
		teammates={teammatesToConvocate}
		team={$team}
		on:convocate={handleConvocate}
		event={$event}
	/>
{/if}
