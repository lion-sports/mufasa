<script lang="ts">
  import type { Invitation } from '$lib/services/invitations/invitations.service'
	import { type ComponentProps } from 'svelte'
	import { Icon, SimpleTable } from '@likable-hair/svelte'
	import InvitationStatusChip from './InvitationStatusChip.svelte'
	import ConfirmOrCancelDialog from '../common/ConfirmOrCancelDialog.svelte'
	import { DateTime } from 'luxon'

	interface Props {
		invitations?: Invitation[]
    ondiscard?: (params: { invitation: Invitation }) => void
	}

	let { invitations = [], ondiscard }: Props = $props()

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
		},
    {
			value: 'createdAt',
			label: 'Invitato il',
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

		if (!!discardingInvitation && !!ondiscard) {
			ondiscard({ invitation: discardingInvitation })
		}
	}
</script>

<div style:max-width="100%" style:overflow="auto">
	<SimpleTable {headers} items={invitations} resizableColumns={false}>
		{#snippet customSnippet({ item, header })}
			{#if header.value == 'status'}
        <div class="w-fit">
          <InvitationStatusChip status={item.status}></InvitationStatusChip>
        </div>
			{:else if header.value == 'invitedBy'}
				{item.invitedBy.email}
      {:else if header.value == 'createdAt'}
				{DateTime.fromJSDate(new Date(item.createdAt)).setLocale('it-IT').toLocaleString(DateTime.DATETIME_MED)}
			{:else if header.value == 'group'}
				{#if !!item.group?.name}
					{item.group?.name}
				{:else}
					Nessuno
				{/if}
			{/if}
		{/snippet}
		{#snippet rowActionsSnippet({ item })}
			<div class="flex mr-2">
        {#if item.status === 'pending'}
          <button onclick={() => handleDeleteClick(item)}>
            <Icon
              name="mdi-delete"
              --icon-color="rgb(var(--global-color-error-500))"
            />
          </button>
        {/if}
			</div>
		{/snippet}
	</SimpleTable>
</div>

<ConfirmOrCancelDialog
  confirmText="Scarta"
	cancelText="Mantieni"
  description={`Sei sicuro di voler scartare l'invito a ${discardingInvitation?.invitedEmail}?`}
  cancel={() => (confirmDialogOpen = false)}
	confirm={confirmTeammateDeletion}
  bind:open={confirmDialogOpen}
></ConfirmOrCancelDialog>