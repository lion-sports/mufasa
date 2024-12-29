<script lang="ts" context="module">
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'
	import { MediaQuery, Icon } from '@likable-hair/svelte'
	import EventsList from '$lib/components/events/EventsList.svelte'
	import GlobalCalendar from './GlobalCalendar.svelte'

	export let events: Event[] = [],
    canCreate: boolean = false

	let selectedDate: Date | undefined,
		selectedEvents: Event[] = []

	$: formattedDate = !!selectedDate
		? DateTime.fromJSDate(selectedDate).setLocale('it').toLocaleString(DateTime.DATE_MED)
		: ''

	function handleCloseDrawer() {
		selectedDate = undefined
	}
</script>

<MediaQuery let:mAndDown>
	<div class="calendar-container">
    <div class="w-full">
      <GlobalCalendar bind:selectedDate bind:selectedEvents bind:events bind:canCreate />
    </div>
		{#if !mAndDown}
			<div class="event-drawer" class:opened={!!selectedDate} class:closed={!selectedDate}>
				<div class="title-container">
					<div class="title">
						{formattedDate}
					</div>
					<div class="close-button">
						<Icon name="mdi-close" on:click={handleCloseDrawer} click />
					</div>
				</div>
				<div class="events-list">
					<EventsList
						precompiledDate={selectedDate ? DateTime.fromJSDate(selectedDate) : undefined}
						events={selectedEvents}
						showTeamName
            bind:canCreate
					/>
				</div>
			</div>
		{/if}
	</div>
	{#if mAndDown}
		<div class="hr" />
		<div class="title-container">
			<div class="title">
				{formattedDate}
			</div>
		</div>
		<EventsList
			precompiledDate={selectedDate ? DateTime.fromJSDate(selectedDate) : undefined}
			events={selectedEvents}
			showTeamName
		/>
	{/if}
</MediaQuery>

<style>
	.calendar-container {
		display: flex;
	}

	.event-drawer {
		transition: all 0.4s cubic-bezier(0.075, 0.82, 0.165, 1);
		height: 100%;
    flex-grow: 1;
	}

	.events-list {
		max-height: calc(100vh - 200px);
		overflow: auto;
	}

	.event-drawer.opened {
		width: 400px;
	}

	.event-drawer.closed {
		width: 0px;
		visibility: collapse;
	}

	.title-container {
		display: flex;
		padding-left: 10px;
		padding-right: 10px;
		align-items: center;
		margin-top: 20px;
		margin-bottom: 20px;
	}

	.title {
		flex-grow: 1;
		font-weight: 700;
		font-size: 1.3rem;
	}

	.hr {
		margin-top: 10px;
		margin-bottom: 10px;
		border-top: 0.5px solid var(--global-thin-contrast-color);
	}
</style>
