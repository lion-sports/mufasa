<script lang="ts" module>
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

	interface Props {
		invitations?: Invitation[]
	}

	let { invitations = [] }: Props = $props()

	let headers: ComponentProps<typeof SimpleTable>['headers'] = [
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

	let confirmDialogOpen: boolean = $state(false),
		discardingInvitation: Invitation | undefined = $state()
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
		{#snippet customSnippet({ item, header })}
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
		{/snippet}
		{#snippet rowActionsSnippet({ item })}
			<div style:display="flex" style:justify-content="end">
				<Icon
					name="mdi-delete"
					--icon-color="rgb(var(--global-color-error-500))"
					onclick={() => handleDeleteClick(item)}
				/>
			</div>
		{/snippet}
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
