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

<div class="inbox-container">
	<div class="inbox-header">
		<h1>Inbox</h1>
		<div class="header-actions">
			{#if unreadCount > 0}
				<span class="unread-badge">
					{unreadCount} non {unreadCount === 1 ? 'letta' : 'lette'}
				</span>
			{/if}

			<button
				class="filter-button"
				class:active={showUnreadOnly}
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
		<div class="error-message">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="loading-container">
			<p>Caricamento notifiche...</p>
		</div>
	{:else if notifications.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📭</div>
			<h2>Nessuna notifica</h2>
			<p>
				{showUnreadOnly
					? 'Non hai notifiche non lette'
					: 'Non hai ancora ricevuto notifiche'}
			</p>
		</div>
	{:else}
		<div class="notifications-list">
			{#each notifications as notification (notification._id)}
				<NotificationItem
					{notification}
					onmarkAsRead={handleNotificationMarkedAsRead}
					oninvitationAction={handleInvitationAction}
				/>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button
					class="pagination-button"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
				>
					Precedente
				</button>

				<span class="page-info">
					Pagina {currentPage} di {totalPages}
				</span>

				<button
					class="pagination-button"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(currentPage + 1)}
				>
					Successiva
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.inbox-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px;
	}

	.inbox-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 16px;
	}

	.inbox-header h1 {
		margin: 0;
		color: rgb(var(--global-color-gray-800));
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.unread-badge {
		background-color: rgb(var(--global-color-primary-500));
		color: white;
		padding: 4px 12px;
		border-radius: 16px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.filter-button {
		background: none;
		border: 1px solid rgb(var(--global-color-gray-300));
		color: rgb(var(--global-color-gray-600));
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-button:hover {
		background-color: rgb(var(--global-color-gray-50));
	}

	.filter-button.active {
		background-color: rgb(var(--global-color-primary-500));
		color: white;
		border-color: rgb(var(--global-color-primary-500));
	}

	.error-message {
		background-color: rgb(var(--global-color-red-50));
		color: rgb(var(--global-color-red-700));
		padding: 12px;
		border-radius: 4px;
		margin-bottom: 16px;
	}

	.loading-container {
		text-align: center;
		padding: 48px;
		color: rgb(var(--global-color-gray-500));
	}

	.empty-state {
		text-align: center;
		padding: 48px 24px;
		color: rgb(var(--global-color-gray-500));
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 16px;
	}

	.empty-state h2 {
		margin: 0 0 8px 0;
		color: rgb(var(--global-color-gray-700));
	}

	.empty-state p {
		margin: 0;
	}

	.notifications-list {
		margin-bottom: 24px;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16px;
		padding: 16px 0;
	}

	.pagination-button {
		background: none;
		border: 1px solid rgb(var(--global-color-gray-300));
		color: rgb(var(--global-color-gray-600));
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pagination-button:hover:not(:disabled) {
		background-color: rgb(var(--global-color-gray-50));
	}

	.pagination-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-info {
		color: rgb(var(--global-color-gray-600));
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.inbox-container {
			padding: 16px;
		}

		.inbox-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>