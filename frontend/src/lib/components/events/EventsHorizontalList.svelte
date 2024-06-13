<script lang="ts" context="module">
	import type { Event } from '$lib/services/events/events.service'
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import { DateTime } from 'luxon'
	import qs from 'qs'
	import { Icon } from '@likable-hair/svelte'

	export let events: Event[] = [],
		team: { id: number } | undefined = undefined,
		precompiledDate: DateTime | undefined = undefined,
    canCreate: boolean = false

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
				goto(`/teams/${team.id}/events/new?${qs.stringify({ start: precompiledDate.toJSDate() })}`)
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

	$: sortedEvents = !!events
		? events.sort((a, b) => {
				return DateTime.fromJSDate(new Date(a.start)).diff(DateTime.fromJSDate(new Date(b.start)))
					.milliseconds
		})
		: []
</script>

<div class="events-container">
	{#if events.length > 0}
		{#each sortedEvents as event}
			<button class="event-post" on:click={() => handleEventClick(event)} class:clickable={true}>
        <div class="event-post-band"></div>
				<div class="title">{event.name}</div>
        <div class="team">{event.team.name}</div>
				<div class="time">{formattedTime(event)}</div>
				{#if !!event.description}
					<div class="description" style:white-space="pre-wrap">{event.description}</div>
				{/if}
        <div class="event-post-cta">
          <Icon name="mdi-arrow-right" --icon-size="24px"></Icon>
        </div>
      </button>
		{/each}
		{#if !!team && canCreate}
			<div class="plus-container">
				<Icon name="mdi-plus" click on:click={handlePlusClick} />
			</div>
		{/if}
	{:else}
		<slot name="no-data">
			<div class="no-data">Nessun evento</div>
		</slot>
	{/if}
</div>

<style>
	.events-container {
		display: flex;
		flex-wrap: nowrap;
		gap: 10px;
    overflow-x: auto;
	}

	.event-post {
		background-color: rgb(var(--global-color-background-300));
		border-radius: 5px;
		padding-top: 5px;
		padding-left: 20px;
		padding-right: 10px;
		padding-bottom: 5px;
    position: relative;
    text-align: left;
    transition: all .2s cubic-bezier(0.23, 1, 0.320, 1);
	}

  .event-post:hover {
    background-color: rgb(var(--global-color-background-400));
  }

  @media (min-width: 768px) {
    .event-post {
      min-width: 240px;
    }

    .event-post:hover {
      min-width: 260px;
    }
  }

  @media (max-width: 767.98px) {
    .event-post {
      min-width: 90%;
      scroll-snap-align: start;
    }

    .events-container {
      scroll-snap-type: x mandatory;
      width: 100%;
    }
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

  .event-post-cta {
    position: absolute;
    bottom: 8px;
    right: 8px;
  }

	.clickable {
		cursor: pointer;
	}

	.title {
		font-weight: 700;
		font-size: 1.2rem;
		margin-top: 5px;
		margin-bottom: 5px;
	}

  .team {
		font-size: 0.8rem;
		font-weight: 500;
	}

	.time {
		font-size: 0.8rem;
		font-weight: 200;
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
