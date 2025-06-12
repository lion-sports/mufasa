<script lang="ts" module>
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import { DateTime } from 'luxon'
	import qs from 'qs'
	import { Icon } from '@likable-hair/svelte'
	import type { Teammate } from '$lib/services/teams/teams.service'

	interface Props {
		events?: Event[]
		team?: { id: number } | undefined
		teammate?: Teammate | undefined
		precompiledDate?: DateTime | undefined
		showTeamName?: boolean
		canCreate?: boolean
		noData?: import('svelte').Snippet
	}

	let {
		events = [],
		team = undefined,
		teammate = undefined,
		precompiledDate = undefined,
		showTeamName = false,
		canCreate = false,
		noData
	}: Props = $props()

	function formattedTime(event: Event) {
		let fromTime: string = DateTime.fromJSDate(event.start)
			.setLocale('it')
			.toLocaleString(DateTime.TIME_SIMPLE)
		let toTime: string = DateTime.fromJSDate(event.end)
			.setLocale('it')
			.toLocaleString(DateTime.TIME_SIMPLE)
		return `${fromTime} - ${toTime}`
	}

	function handlePlusClick() {
		if (!!team) {
			if (!!precompiledDate) {
				goto(
					`/teams/${team.id}/events/new?${qs.stringify({ start: precompiledDate.toJSDate(), end: precompiledDate.toJSDate() })}`
				)
			} else {
				goto('/teams/' + team.id + '/events/new')
			}
		}
	}

	function handleEventClick(event: Event) {
		if (!!team) {
			goto(`/teams/${team.id}/events/${event.id}/general`)
		} else if (!!event.team) {
			goto(`/teams/${event.team.id}/events/${event.id}/general`)
		}
	}

	function isConvocated(event: Event): boolean {
		return !!teammate && event.convocations.some((c) => !!teammate && c.teammateId == teammate.id)
	}

	let sortedEvents = $derived(
		!!events
			? events.sort((a, b) => {
					return DateTime.fromJSDate(new Date(a.start)).diff(DateTime.fromJSDate(new Date(b.start)))
						.milliseconds
				})
			: []
	)
</script>

<div class="events-container">
	{#if events.length > 0}
		{#each sortedEvents as event}
			<button class="event-post" onclick={() => handleEventClick(event)} class:clickable={true}>
				<div class="event-post-band"></div>
				<div class="title">{event.name}</div>
				<div class="time">
					{formattedTime(event)}
					{#if showTeamName}
						,
						<span style:margin-left="3px">
							{event.team.name}
						</span>
					{/if}
				</div>
				{#if !!event.description}
					<div class="description" style:white-space="pre-wrap">{event.description}</div>
				{/if}
				{#if isConvocated(event)}
					<div
						class="convocated-badge"
						style:display="flex"
						style:align-items="center"
						style:gap="10px"
						style:margin-bottom="10px"
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
			</button>
		{/each}
		{#if !!team && canCreate}
			<div class="plus-container">
				<Icon name="mdi-plus" onclick={handlePlusClick} />
			</div>
		{/if}
	{:else if noData}{@render noData()}{:else}
		<div class="no-data">
			Nessun evento,
			<button
				onclick={handlePlusClick}
				class="inline underline text-[rgb(var(--global-color-primary-500))]">creane uno</button
			>
		</div>
	{/if}
</div>

<style>
	.events-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.event-post {
		background-color: rgb(var(--global-color-background-300));
		border-radius: 5px;
		padding-top: 5px;
		padding-left: 20px;
		padding-right: 10px;
		padding-bottom: 5px;
		margin-left: 10px;
		margin-right: 10px;
		text-align: left;
		position: relative;
	}

	.event-post-band {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 10px;
		left: 0px;
		border-radius: 5px 0px 0px 5px;
		background-color: rgb(var(--global-color-primary-500));
	}

	.clickable {
		cursor: pointer;
	}

	.title {
		font-weight: 500;
		font-size: 1.2rem;
		margin-top: 5px;
		margin-bottom: 5px;
	}

	.time {
		font-size: 0.8rem;
		font-weight: 300;
		margin-bottom: 10px;
	}

	.description {
		font-size: 1rem;
		margin-bottom: 10px;
	}

	.no-data {
		font-weight: 300;
		text-align: center;
	}

	.plus-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 5px;
		margin-bottom: 15px;
	}
</style>
