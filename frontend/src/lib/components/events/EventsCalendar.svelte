<script lang="ts" context="module">
	import type { Team, Teammate } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'

	import qs from 'qs'
	import { Button, Calendar, Icon, MediaQuery } from '@likable-hair/svelte'
	import { createEventDispatcher } from 'svelte'

	let dispatch = createEventDispatcher<{
		nextMonth: {
			month: number
			year: number
		}
		previousMonth: {
			month: number
			year: number
		}
	}>()

	export let team: Team | undefined,
		teammate: Teammate | undefined = undefined,
		selectedDate: Date = new Date(),
		selectedEvents: Event[] = [],
		events: Event[],
		visibleMonth: number = DateTime.now().get('month') - 1,
		visibleYear: number = DateTime.now().get('year'),
    canCreate: boolean = false

	let dayGroupedEvents: {
		[key: string]: Event[] | undefined
	} = {}

	onMount(() => {
		groupEventByDate()
	})

	function groupEventByDate() {
		dayGroupedEvents = {}

		if (!!events && events.length > 0) {
			for (let i = 0; i < events.length; i += 1) {
				let dayKey = DateTime.fromJSDate(events[i].start).toFormat('yyyyMMdd')
				if (!dayGroupedEvents[dayKey]) dayGroupedEvents[dayKey] = []
				dayGroupedEvents[dayKey]?.push(events[i])
			}
		}
	}

	$: monthName = DateTime.now()
		.set({
			month: parseInt(visibleMonth.toString()) + 1,
			year: visibleYear
		})
		.setLocale('it')
		.toLocaleString({
			month: 'long',
			year: 'numeric'
		})

	function nextMonth() {
		if (visibleMonth == 11) {
			visibleMonth = 0
			visibleYear += 1
		} else {
			visibleMonth += 1
		}

		dispatch('nextMonth', {
      month: visibleMonth,
      year: visibleYear
    })
	}

	function previousMonth() {
		if (visibleMonth == 0) {
			visibleMonth = 11
			visibleYear -= 1
		} else {
			visibleMonth -= 1
		}

		dispatch('previousMonth', {
      month: visibleMonth,
      year: visibleYear
    })
	}

	function handleDayClick(dayStat: {
    dayOfMonth: number,
    month: number,
    year: number
  }) {
		let selection = DateTime.now().set({
			day: dayStat.dayOfMonth,
			month: dayStat.month + 1,
			year: dayStat.year
		})
		selectedDate = selection.toJSDate()
	}

	function handlePlusClick(dayStat: {
    dayOfMonth: number,
    month: number,
    year: number
  }) {
		if (!!team) {
			let date = DateTime.now()
				.set({
					day: dayStat.dayOfMonth,
					month: dayStat.month + 1,
					year: dayStat.year
				})
				.toJSDate()

			goto(`/teams/${team.id}/events/new?${qs.stringify({ start: date })}`)
		}
	}

	function isGreaterThan(array: any[] | undefined, num: number) {
		if (!!array) return array.length > num
		else return false
	}

	function isConvocated(event: Event): boolean {
		return !!teammate && event.convocations.some((c) => !!teammate && c.teammateId == teammate.id)
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
</script>

<MediaQuery let:mAndDown>
	<div style:height="auto" style:width="100%">
		{#if mAndDown}
			<div class="month-switcher">
				<Icon name="mdi-chevron-left" click on:click={previousMonth} />
				<div>
					{monthName}
					<slot name="options" />
				</div>
				<Icon name="mdi-chevron-right" click on:click={nextMonth} />
			</div>
		{:else}
			<div class="month-switcher">
				<Icon name="mdi-chevron-left" click on:click={previousMonth} />
				<Icon name="mdi-chevron-right" click on:click={nextMonth} />
				<div class="month-name">
					{monthName}
				</div>
				<div>
					<slot name="options" />
				</div>
				<slot name="header-append" />
			</div>
		{/if}
		<Calendar
			bind:visibleMonth
			bind:visibleYear
			bind:selectedDate
			locale="it"
			--calendar-height={mAndDown ? '200px' : 'auto'}
			--calendar-grid-gap="0px"
		>
			<div
				slot="day"
				let:dayStat
				let:selected
				class="day-slot"
				style:border-color="rgb(var(--global-color-background-300))"
				on:click={() => handleDayClick(dayStat)}
				on:keypress={() => handleDayClick(dayStat)}
        role="presentation"
			>
				{#if !mAndDown}
					<div>
						{#each dayGroupedEvents[DateTime.now()
								.set({ day: dayStat.dayOfMonth, month: dayStat.month + 1, year: dayStat.year })
								.toFormat('yyyyMMdd')]?.slice(0, 2) || [] as event}
							<div style:position="relative">
								<div
									class="event-post"
									style:background-color="rgb(var(--global-color-primary-700))"
									style:color="rgb(var(--global-color-grey-50))"
								>
									<div style:white-space="nowrap" style:font-weight="800" style:max-width="100px">{event.name}</div>
									<div style:font-size="0.8rem" style:font-weight="300">{event.team.name}</div>
								</div>
							</div>
						{/each}
						{#if isGreaterThan(dayGroupedEvents[DateTime.now()
									.set({ day: dayStat.dayOfMonth, month: dayStat.month + 1, year: dayStat.year })
									.toFormat('yyyyMMdd')], 2)}
							<div style:margin-left="5px" style:font-size=".8rem">and more</div>
						{/if}
					</div>
					{#if canCreate && !!team}
						<div class="add-new">
							<Button
								buttonType="icon"
								on:click={() => handlePlusClick(dayStat)}
								--button-padding="0px 4px"
								--button-border-radius="4px"
							>
								<Icon
									name="mdi-plus"
									--icon-size="10px"
									--icon-color="rgb(var(--global-color-background-900))"
								/>
							</Button>
						</div>
					{/if}
				{:else if isGreaterThan(dayGroupedEvents[DateTime.now()
							.set({ day: dayStat.dayOfMonth, month: dayStat.month + 1, year: dayStat.year })
							.toFormat('yyyyMMdd')], 0)}
					<div class="dot" />
				{/if}
				<div
					class="day-of-month"
					style:color={selected
						? 'rgb(var(--global-color-primary-500))'
						: 'rgb(var(--global-color-contrast-900))'}
				>
					{dayStat.dayOfMonth}
				</div>
			</div>
		</Calendar>
	</div>
</MediaQuery>

<style>
	@media (max-width: 1024px) {
		.month-switcher {
			justify-content: space-between;
			margin-bottom: 10px;
			margin-top: 10px;
		}

		.day-slot {
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
		}

		.dot {
			background-color: rgb(var(--global-color-primary-500));
			height: 4px;
			width: 4px;
			border-radius: 50%;
			top: 27px;
			position: absolute;
		}

		.day-of-month {
			border-radius: 50%;
			height: 30px;
			width: 30px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	@media (min-width: 1025px) {
		.month-switcher {
			justify-content: left;
			margin-bottom: 20px;
			margin-top: 20px;
		}

		.day-slot {
			border: 1px solid;
			height: 130px;
			position: relative;
		}

		.day-of-month {
			position: absolute;
			right: 5px;
			bottom: 5px;
		}
	}

	.day-slot:hover .add-new {
		display: block !important;
	}

	.add-new {
		display: none;
		position: absolute;
		left: 5px;
		bottom: 5px;
		border-radius: 5px;
	}

	.month-switcher {
		display: flex;
		gap: 20px;
	}

	.month-name {
		font-size: 1.5rem;
		min-width: 200px;
		text-align: center;
	}

	.event-post::before {
		content: '';
		position: absolute;
		left: 5px;
		top: 0px;
		bottom: 0px;
		width: 3px;
		border-radius: 2px 2px 0px 0px;
		background-color: rgb(var(--global-color-primary-200));
	}

	.event-post {
		font-size: 0.8rem;
		word-break: keep-all;
		margin: 5px;
		padding-top: 4px;
		padding-bottom: 4px;
		padding-right: 4px;
		padding-left: 8px;
		text-overflow: clip;
		overflow: hidden;
		border-radius: 3px;
    line-height: 14px;
	}
</style>
