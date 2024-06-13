<script lang="ts" context="module">
	import type { Invitation } from '$lib/services/invitations/invitations.service'
</script>

<script lang="ts">
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import { Icon, SimpleTable } from '@likable-hair/svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'

	let dispatch = createEventDispatcher<{
		discard: {
			invitation: Invitation
		}
	}>()

	export let invitations: Invitation[] = []

	let headers: ComponentProps<SimpleTable>['headers'] = [
		{
			value: 'invitedEmail',
			label: 'Email',
			type: {
				key: 'string'
			}
		},
		{
			value: 'status',
			label: 'Stato',
			type: {
				key: 'custom'
			}
		},
		{
			value: 'group',
			label: 'Gruppo',
			type: {
				key: 'custom'
			}
		},
		{
			value: 'invitedBy',
			label: 'Invitato da',
			type: {
				key: 'custom'
			}
		}
	]

	let confirmDialogOpen: boolean, discardingInvitation: Invitation | undefined
	function handleDeleteClick(teammate: any) {
		discardingInvitation = teammate
		confirmDialogOpen = true
	}

	function confirmTeammateDeletion() {
		confirmDialogOpen = false

		if (!!discardingInvitation) {
			dispatch('discard', {
				invitation: discardingInvitation
			})
		}
	}
</script>

<div style:max-width="100%" style:overflow="auto">
	<SimpleTable {headers} items={invitations}>
		<svelte:fragment slot="custom" let:item let:header>
			{#if header.value == 'status'}
				{item.status}
			{:else if header.value == 'invitedBy'}
				{item.invitedBy.email}
			{:else if header.value == 'group'}
				{#if !!item.group?.name}
					{item.group?.name}
				{:else}
					Nessuno
				{/if}
			{/if}
		</svelte:fragment>
		<div style:display="flex" style:justify-content="end" slot="rowActions" let:item>
			<Icon
				name="mdi-delete"
				click
				--icon-color="rgb(var(--global-color-error-500))"
				on:click={() => handleDeleteClick(item)}
			/>
		</div>
	</SimpleTable>
</div>

<ConfirmDialog
	confirmText="Annulla"
	cancelText="Mantieni"
	title="Annula invito"
	description={`Sei sicuro di voler annullare l'invito a ${discardingInvitation?.invitedEmail}?`}
	bind:open={confirmDialogOpen}
	on:cancel-click={() => (confirmDialogOpen = false)}
	on:confirm-click={confirmTeammateDeletion}
/>
