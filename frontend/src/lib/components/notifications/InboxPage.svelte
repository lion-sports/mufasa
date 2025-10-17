<script lang="ts">
	import { onMount } from 'svelte'
	import NotificationsService from '$lib/services/notifications/notifications.service'
	import type { Notification, PaginatedNotifications } from '$lib/services/notifications/notifications.service'
	import NotificationItem from './NotificationItem.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'

	let notificationsService = new NotificationsService({ fetch })
	let notifications: Notification[] = $state([])
	let unreadCount = $state(0)
	let loading = $state(false)
	let error = $state('')
	let currentPage = $state(1)
	let totalPages = $state(1)
	let showUnreadOnly = $state(false)

	onMount(async () => {
		await loadNotifications()
		await loadUnreadCount()
	})

	async function loadNotifications() {
		try {
			loading = true
			error = ''

			const response: PaginatedNotifications = await notificationsService.list({
				page: currentPage,
				perPage: 20,
				read: showUnreadOnly ? false : undefined
			})

			notifications = response.data
			totalPages = response.meta.totalPages
		} catch (err) {
			error = 'Errore nel caricamento delle notifiche'
			console.error(err)
		} finally {
			loading = false
		}
	}

	async function loadUnreadCount() {
		try {
			unreadCount = await notificationsService.getUnreadCount()
		} catch (err) {
			console.error('Errore nel caricamento del conteggio non letti:', err)
		}
	}

	async function handleMarkAllAsRead() {
		try {
			await notificationsService.markAllAsRead()
			await loadNotifications()
			await loadUnreadCount()
		} catch (err) {
			error = 'Errore nel marcare come lette tutte le notifiche'
			console.error(err)
		}
	}

	async function handleNotificationMarkedAsRead() {
		await loadUnreadCount()
	}

	async function handleInvitationAction(_notification: Notification, _action: 'accept' | 'reject') {
		// Refresh notifications after invitation action
		await loadNotifications()
		await loadUnreadCount()
	}

	async function toggleUnreadFilter() {
		showUnreadOnly = !showUnreadOnly
		currentPage = 1
		await loadNotifications()
	}

	async function goToPage(page: number) {
		currentPage = page
		await loadNotifications()
	}
</script>

<div class="max-w-3xl mx-auto p-4 md:p-6">
	<div class="flex flex-col md:flex-row items-start md:justify-between md:items-center mb-6 flex-wrap gap-4">
		<div class="flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-start">
			{#if unreadCount > 0}
				<span class="px-3 py-1 rounded-2xl text-xs opacity-50">
					{unreadCount} non {unreadCount === 1 ? 'letta' : 'lette'}
				</span>
			{/if}

			<button
				class="bg-transparent border border-[rgb(var(--global-color-gray-300))] text-[rgb(var(--global-color-gray-600))] px-4 py-2 rounded cursor-pointer transition-all duration-200 ease-in-out hover:bg-[rgb(var(--global-color-gray-50))]"
				class:!bg-[rgb(var(--global-color-primary-500))]={showUnreadOnly}
				class:!text-white={showUnreadOnly}
				class:!border-[rgb(var(--global-color-primary-500))]={showUnreadOnly}
				onclick={toggleUnreadFilter}
			>
				{showUnreadOnly ? 'Mostra tutte' : 'Solo non lette'}
			</button>

			{#if unreadCount > 0}
				<StandardButton on:click={handleMarkAllAsRead}>
					Segna tutte come lette
				</StandardButton>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="bg-[rgb(var(--global-color-red-50))] text-[rgb(var(--global-color-red-700))] p-3 rounded mb-4">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12 text-[rgb(var(--global-color-gray-500))]">
			<p>Caricamento notifiche...</p>
		</div>
	{:else if notifications.length === 0}
		<div class="text-center py-12 px-6 text-[rgb(var(--global-color-gray-500))]">
			<div class="text-6xl mb-4">📭</div>
			<h2 class="m-0 mb-2 text-[rgb(var(--global-color-gray-700))]">Nessuna notifica</h2>
			<p class="m-0">
				{showUnreadOnly
					? 'Non hai notifiche non lette'
					: 'Non hai ancora ricevuto notifiche'}
			</p>
		</div>
	{:else}
		<div class="mb-6">
			{#each notifications as notification (notification._id)}
				<NotificationItem
					{notification}
					onmarkAsRead={handleNotificationMarkedAsRead}
					oninvitationAction={handleInvitationAction}
				/>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="flex justify-center items-center gap-4 py-4">
				<button
					class="bg-transparent border border-[rgb(var(--global-color-gray-300))] text-[rgb(var(--global-color-gray-600))] px-4 py-2 rounded cursor-pointer transition-all duration-200 ease-in-out hover:bg-[rgb(var(--global-color-gray-50))] disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
				>
					Precedente
				</button>

				<span class="text-[rgb(var(--global-color-gray-600))] text-sm">
					Pagina {currentPage} di {totalPages}
				</span>

				<button
					class="bg-transparent border border-[rgb(var(--global-color-gray-300))] text-[rgb(var(--global-color-gray-600))] px-4 py-2 rounded cursor-pointer transition-all duration-200 ease-in-out hover:bg-[rgb(var(--global-color-gray-50))] disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(currentPage + 1)}
				>
					Successiva
				</button>
			</div>
		{/if}
	{/if}
</div>