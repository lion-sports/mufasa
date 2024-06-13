<script lang="ts">
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
	import { DateTime, type WeekdayNumbers } from 'luxon'
	import { onMount, createEventDispatcher, type ComponentProps } from 'svelte'
	import { goto } from '$app/navigation'
	import EventsService from '$lib/services/events/events.service'
	import qs from 'qs'
	import { Icon, MediaQuery } from '@likable-hair/svelte'
	import Divider from '$lib/components/common/Divider.svelte'
	import OptionMenu from '$lib/components/common/OptionMenu.svelte'
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte'

	export let team: Team,
		teammate: Teammate | undefined = undefined,
		selectedDate: Date = new Date(),
		selectedEvents: Event[] = [],
		events: Event[],
		visibleYear: number = DateTime.now().get('year'),
		visibleWeek: number = DateTime.now().get('weekNumber'),
    canUpdate: boolean = false,
    canDestroy: boolean = false,
    canCreate: boolean = false

	let dispatch = createEventDispatcher<{
		nextWeek: {
			visibleWeek: number
			visibleYear: number
		}
		previousWeek: {
			visibleWeek: number
			visibleYear: number
		}
	}>()

	let dayGroupedEvents: {
			[key: string]: Event[] | undefined
		} = {},
		options: NonNullable<ComponentProps<OptionMenu>['options']> = []

	onMount(() => {
		groupEventByDate()

		if (canUpdate) {
			options.push({
				name: 'edit',
				title: 'Modifica',
				icon: 'mdi-pencil'
			})
		}

		options.push({
			name: 'view',
			title: 'Visualizza',
			icon: 'mdi-eye'
		})

		if (canDestroy) {
			options.push({
				name: 'destroy',
				title: 'Elimina',
				icon: 'mdi-delete',
				style: {
					color: 'rgb(var(--global-color-error-500))'
				}
			})
		}
	})

	function groupEventByDate() {
		dayGroupedEvents = {}

		if (!!events && events.length > 0) {
			for (let i = 0; i < events.length; i += 1) {
				let dayKey = DateTime.fromJSDate(events[i].start).toFormat('yyyyMMdd')
				if (!dayGroupedEvents[dayKey]) dayGroupedEvents[dayKey] = []
				dayGroupedEvents[dayKey]?.push(events[i])
			}

			dayGroupedEvents = { ...dayGroupedEvents }
		}
	}

	let weekName: string = ''
	$: {
		let firstDayOfWeek = DateTime.fromObject({
			weekday: 1,
			weekNumber: visibleWeek,
			weekYear: visibleYear
		})
			.setLocale('it')
			.toLocaleString({
				day: 'numeric',
				month: 'short'
			})

		let lastDayOfWeek = DateTime.fromObject({
			weekday: 7,
			weekNumber: visibleWeek,
			weekYear: visibleYear
		})
			.setLocale('it')
			.toLocaleString({
				day: 'numeric',
				month: 'short'
			})

		weekName = `${firstDayOfWeek} - ${lastDayOfWeek} ${visibleYear}`
	}

	function nextWeek() {
		let currentVisibleWeek = DateTime.fromObject({
			weekday: 1,
			weekNumber: visibleWeek,
			weekYear: visibleYear
		})

		let nextVisibleWeek = currentVisibleWeek.plus({
			week: 1
		})

		if (currentVisibleWeek.get('weekYear') != nextVisibleWeek.get('weekYear')) {
			visibleYear += 1
			visibleWeek = 1
		} else {
			visibleWeek += 1
		}

		dispatch('nextWeek', {
			visibleWeek,
			visibleYear
		})
	}

	function previousWeek() {
		let currentVisibleWeek = DateTime.fromObject({
			weekday: 1,
			weekNumber: visibleWeek,
			weekYear: visibleYear
		})

		let previousVisibleWeek = currentVisibleWeek.minus({
			week: 1
		})

		if (currentVisibleWeek.get('weekYear') != previousVisibleWeek.get('weekYear')) {
			visibleWeek = previousVisibleWeek.get('weekNumber')
			visibleYear -= 1
		} else {
			visibleWeek -= 1
		}

		dispatch('previousWeek', {
			visibleWeek,
			visibleYear
		})
	}

	function getEventsFromWeekDay(weekday: WeekdayNumbers): Event[] | undefined {
		let date = DateTime.fromObject({
			weekNumber: visibleWeek,
			weekYear: visibleYear,
			weekday: weekday
		})

		return dayGroupedEvents[date.toFormat('yyyyMMdd')]
	}

	function getWeekdayNameFromIndex(weekday: WeekdayNumbers): string {
		return DateTime.fromObject({
			weekNumber: visibleWeek,
			weekYear: visibleYear,
			weekday: weekday
		})
			.setLocale('it')
			.toLocaleString({
				weekday: 'long',
				day: 'numeric'
			})
	}

	function getEventTimeRangeString(event: Event): string {
		let fromTime = DateTime.fromJSDate(event.start).toFormat('HH:mm')
		let toTime = DateTime.fromJSDate(event.end).toFormat('HH:mm')

		return `${fromTime} - ${toTime}`
	}

	$: if (!!events) groupEventByDate()
	$: {
		if (!!selectedDate) {
			let key = DateTime.now()
				.set({
					day: selectedDate.getDate(),
					month: selectedDate.getMonth() + 1,
					year: selectedDate.getFullYear()
				})
				.toFormat('yyyyMMdd')

			selectedEvents = dayGroupedEvents[key] || []
		}
	}

	function handleEventTitleClick(event: Event) {
		goto(`/teams/${team.id}/events/${event.id}/general`)
	}

	let confirmDeletionDialogOpen: boolean = false,
		deletingEvent: Event | undefined,
		loadingDelete: boolean = false
	function handleEventOptionClick(e: CustomEvent<{ element: (typeof options)[0] }>, event: Event) {
		if (e.detail.element.name == 'edit' && !!team) {
			goto(`/teams/${team.id}/events/${event.id}/edit`)
		} else if (e.detail.element.name == 'view' && !!team) {
			goto(`/teams/${team.id}/events/${event.id}/general`)
		} else if (e.detail.element.name == 'destroy' && !!team) {
			confirmDeletionDialogOpen = true
			deletingEvent = event
		}
	}

	async function handleConfirm() {
		if (!!deletingEvent) {
			loadingDelete = true
			let service = new EventsService({ fetch })
			await service.destroy({ id: deletingEvent.id })
			loadingDelete = false
			confirmDeletionDialogOpen = false
			events = events.filter((ev) => ev.id != deletingEvent?.id)
		}
	}

	function handlePlusClick(weekday: WeekdayNumbers) {
		let precompiled = DateTime.fromObject({
			weekNumber: visibleWeek,
			weekYear: visibleYear,
			weekday: weekday
		})

		goto(`/teams/${team.id}/events/new?${qs.stringify({ start: precompiled.toJSDate() })}`)
	}

	function isConvocated(event: Event) {
		return !!teammate && event.convocations.some((c) => !!teammate && c.teammateId == teammate.id)
	}

  let weekdays: WeekdayNumbers[] = [1, 2, 3, 4, 5, 6, 7]
</script>

<MediaQuery let:mAndDown>
	<div style:height="auto" style:width="100%">
		{#if mAndDown}
			<div class="week-switcher">
				<Icon name="mdi-chevron-left" click on:click={previousWeek} />
				<div>
					<slot name="options" />
				</div>
				<Icon name="mdi-chevron-right" click on:click={nextWeek} />
			</div>
			<div class="week-name" style:margin-bottom="20px">
				{weekName}
			</div>
		{:else}
			<div class="week-switcher">
				<Icon name="mdi-chevron-left" click on:click={previousWeek} />
				<Icon name="mdi-chevron-right" click on:click={nextWeek} />
				<div class="week-name">
					{weekName}
				</div>
				<slot name="options" />
			</div>
		{/if}
		<div class="date-list">
			{#key dayGroupedEvents}
				{#each weekdays as weekday}
					<div class="day-container">
						<div class="day-name">{getWeekdayNameFromIndex(weekday)}</div>
						<div style:flex-grow="1">
							{#if canCreate}
								<div>
									<Icon name="mdi-plus" click on:click={() => handlePlusClick(weekday)} />
								</div>
							{/if}
							{#if !!getEventsFromWeekDay(weekday)}
								{#each getEventsFromWeekDay(weekday) || [] as event}
									<div class="event">
										<div class="event-title">
											<button on:click={() => handleEventTitleClick(event)} style:cursor="pointer"
												>{event.name}</button
											>
											<div style:margin-left="10px">
												<OptionMenu {options} on:select={(e) => handleEventOptionClick(e, event)} />
											</div>
										</div>
										<div class="event-subtitle">
											<Icon name="mdi-clock" --icon-size="10pt" />
											{getEventTimeRangeString(event)}
										</div>
										{#if !!event.description}
											<div class="event-description" style:white-space="pre-wrap">
												<Icon name="mdi-text" --icon-size="10pt" />
												{event.description}
											</div>
										{/if}
										{#if isConvocated(event)}
											<div
												class="convocated-badge"
												style:display="flex"
												style:align-items="center"
												style:gap="10px"
												style:margin-left="10px"
											>
												<Icon
													name="mdi-account-check"
													--icon-color="rgb(var(--global-color-success))"
													--icon-size="15pt"
												/>
												<span
													style:color="rgb(var(--global-color-success))"
													style:font-size="0.9rem"
													style:font-weight="300"
												>
													Convocato
												</span>
											</div>
										{/if}
									</div>
								{/each}
							{/if}
						</div>
					</div>
					<Divider marginLeft="0px" />
				{/each}
			{/key}
		</div>
	</div>
</MediaQuery>

<ConfirmDialog
	confirmText="Elimina"
	cancelText="Annulla"
	title="Cancella evento"
	description={`Sei sicuro di voler cancellare l'evento ${deletingEvent?.name}?`}
	bind:open={confirmDeletionDialogOpen}
	on:cancel-click={() => (confirmDeletionDialogOpen = false)}
	on:confirm-click={handleConfirm}
/>

<style>
	@media (max-width: 1024px) {
		.week-switcher {
			justify-content: space-between;
			margin-bottom: 10px;
			margin-top: 10px;
		}
	}

	@media (min-width: 1025px) {
		.week-switcher {
			justify-content: left;
			margin-bottom: 20px;
			margin-top: 20px;
		}
	}

	.week-switcher {
		display: flex;
		gap: 20px;
	}

	.week-name {
		font-size: 1.6rem;
		font-weight: 700;
		min-width: 200px;
		text-align: center;
	}

	.day-container {
		display: flex;
		align-items: flex-start;
		margin-top: 10px;
		margin-bottom: 10px;
	}

	.day-name {
		font-weight: 500;
		min-width: 130px;
		font-size: 1.3rem;
	}

	.event {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 10px;
		margin-top: 10px;
	}

	.event-title {
		font-weight: 500;
		font-size: 1.2rem;
		display: flex;
	}

	.event-subtitle {
		font-weight: 200;
		font-size: 1rem;
		margin-left: 15px;
	}

	.event-description {
		margin-left: 15px;
	}
</style>
