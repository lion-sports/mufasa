<script lang="ts">
  // Implement a logic similar to the widget of the dashboard, using the svelte:component element
	import NotificationsService from '$lib/services/notifications/notifications.service'
	import InvitationsService from '$lib/services/invitations/invitations.service'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import type { Notification } from '$lib/services/notifications/notifications.service'
	import { addErrorToast } from '../ui/sonner'
	import { CircularLoader } from '@likable-hair/svelte'

	interface Props {
		notification: Notification
		onmarkAsRead?: (notification: Notification) => void
		oninvitationAction?: (notification: Notification, action: 'accept' | 'reject') => void
	}

	let { notification, onmarkAsRead, oninvitationAction }: Props = $props()

  let loadingAcceptInvitation: boolean = $state(false),
    loadingRejectInvitation: boolean = $state(false)

	async function handleMarkAsRead() {
		if (!notification.read) {
			let service = new NotificationsService({ fetch })
			await service.markAsRead({ notificationId: notification._id })
			notification.read = true
			onmarkAsRead?.(notification)
		}
	}

	async function handleInvitationAction(action: 'accept' | 'reject') {
		if (notification.type === 'invitation' && notification.info.invitation) {
			let invitationsService = new InvitationsService({ fetch })

      try {
        if (action === 'accept') {
          loadingAcceptInvitation = true
          await invitationsService.acceptInvitation({
            invitation: { id: notification.info.invitation.id }
          })
        } else {
          let confirmed = confirm('Sei sicuro di voler rifiutare l\'invito al team?')
          if(!confirmed) return

          loadingRejectInvitation = true
          await invitationsService.rejectInvitation({
            invitation: { id: notification.info.invitation.id }
          })
        }
      } catch(e: any) {
        addErrorToast({
          title: 'Errore',
          options: {
            description: e
          }
        })
      }

      loadingAcceptInvitation = false
      loadingRejectInvitation = false

			oninvitationAction?.(notification, action)
			await handleMarkAsRead()
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date)
	}
</script>

<div
	class="flex items-start rounded-xl p-4 mb-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 md:p-4 sm:p-3 bg-[rgb(var(--global-color-background-100))] border border-[rgb(var(--global-color-background-300))] shadow-sm hover:shadow-md"
	class:border-l-4={!notification.read}
	class:border-l-[rgb(var(--global-color-primary-500))]={!notification.read}
	onclick={handleMarkAsRead}
	role="presentation"
>
	<div class="mr-3 md:mr-4 flex-shrink-0">
		{#if notification.type === 'invitation'}
			<div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-[rgb(var(--global-color-background-200))] text-[rgb(var(--global-color-contrast-600))]">
				<i class="mdi mdi-email-outline text-lg md:text-xl"></i>
			</div>
		{/if}
	</div>
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2 mb-1">
			{#if notification.type === 'invitation'}
				<h3 class="text-base font-semibold m-0 text-[rgb(var(--global-color-contrast-900))]">Invito</h3>
			{/if}
			{#if !notification.read}
				<div class="w-2 h-2 rounded-full flex-shrink-0 bg-[rgb(var(--global-color-primary-500))]"></div>
			{/if}
		</div>

		<div class="mb-2">
			{#if notification.type === 'invitation' && notification.info.invitation}
        {#if !notification.info.invitation.status || notification.info.invitation.status == 'pending'}
          <p class="text-sm leading-relaxed m-0 text-[rgb(var(--global-color-contrast-700))]">
            Hai ricevuto un invito per unirti a una squadra o club.
          </p>
        {:else}
          <p class="text-sm leading-relaxed m-0 text-[rgb(var(--global-color-contrast-700))]">
            Invito {#if notification.info.invitation.status === 'accepted'}
              accettato.
            {:else if notification.info.invitation.status === 'rejected'}
              rifiutato.
            {/if}
          </p>
        {/if}
			{/if}
		</div>

		<div class="text-xs font-medium text-[rgb(var(--global-color-contrast-500))]">
			{formatDate(notification.firedAt)}
		</div>
	</div>
	<div class="ml-3 md:ml-4 flex-shrink-0 flex items-center">
		{#if notification.type === 'invitation' && notification.info.invitation && (!notification.info.invitation.status || notification.info.invitation.status == 'pending')}
			<div class="flex flex-col sm:flex-row gap-1.5 sm:gap-2 items-center">
				<button
					class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors bg-transparent text-[rgb(var(--global-color-contrast-600))] border border-[rgb(var(--global-color-background-300))] hover:bg-[rgb(var(--global-color-background-200))] hover:text-[rgb(var(--global-color-contrast-800))]"
					onclick={(e) => {
						e.stopPropagation();
						handleInvitationAction('reject');
					}}
				>
          {#if loadingRejectInvitation}
            <CircularLoader 
              --circular-loader-width="24px"
              --circular-loader-height="24px"
            ></CircularLoader>
          {:else}
            Rifiuta
          {/if}
				</button>
				<StandardButton
					on:click={() => handleInvitationAction('accept')}
          --button-padding="4px 8px"
          --button-border-radius="4px"
          loading={loadingAcceptInvitation}
				>
          <div class="font-medium">Accetta</div>
				</StandardButton>
			</div>
		{/if}
	</div>
</div>

