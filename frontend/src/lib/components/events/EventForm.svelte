<script lang="ts" module>
	export type Event = {
		start?: Date
		end?: Date
		name?: string
		description?: string
	}

	import type { Teammate } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { run } from 'svelte/legacy';
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import StandardDatepicker from '$lib/components/common/StandardDatepicker.svelte'
	import StandardTimePicker from '$lib/components/common/StandardTimePicker.svelte'
	import { DateTime } from 'luxon'
	import LabelAndTextarea from '$lib/components/common/LabelAndTextarea.svelte'
	import TeammatesChecklist from '$lib/components/teammates/TeammatesChecklist.svelte'
	import CollapsableSection from '$lib/components/common/CollapsableSection.svelte'
	import type { Group } from '$lib/services/groups/groups.service'

	interface Props {
		event?: Event;
		convocations?: {
			[key: number]: boolean
		};
		mode?: 'create' | 'update';
		padding?: string | undefined;
		margin?: string | undefined;
		width?: string | undefined;
		height?: string | undefined;
		teammates?: Teammate[] | undefined;
		groups?: Group[];
	}

	let {
		event = $bindable({}),
		convocations = $bindable({}),
		mode = 'create',
		padding = undefined,
		margin = undefined,
		width = undefined,
		height = undefined,
		teammates = $bindable(undefined),
		groups = $bindable([])
	}: Props = $props();

	let startTime: string | undefined = $state(),
		endTime: string | undefined = $state()

	run(() => {
		if (!event.start) {
			event.start = new Date()
		}

		if (!event.end) {
			event.end = new Date()
		}

		if (!!event.start) {
			startTime = DateTime.fromJSDate(new Date(event.start)).toFormat('HH:mm')
		}

		if (!!event.end) {
			endTime = DateTime.fromJSDate(new Date(event.end)).toFormat('HH:mm')
		}
	});

	function selectAll() {
		if (!!teammates) {
			convocations = {}
      let convocableTeammates = teammates.filter((t) => !t.group || t.group.convocable)
			for (let i = 0; i < convocableTeammates.length; i += 1) {
				convocations[convocableTeammates[i].id] = true
			}
		}
	}

  function unselectAll() {
    convocations = {}
  }

	function handleStartTimeChange(e: any) {
		if (!event.start) event.start = new Date()

		event.start = DateTime.fromJSDate(event.start)
			.set({
				hour: e.target.value.split(':')[0],
				minute: e.target.value.split(':')[1]
			})
			.toJSDate()

		startTime = e.target.value
	}

	function handleEndTimeChange(e: any) {
		if (!event.end) event.end = new Date()

		event.end = DateTime.fromJSDate(event.end)
			.set({
				hour: e.target.value.split(':')[0],
				minute: e.target.value.split(':')[1]
			})
			.toJSDate()

		endTime = e.target.value
	}
</script>

<div style:padding style:margin style:width style:height>
  <div 
    class="grid grid-cols-1 md:grid-cols-2 duration-infos"
  >
    <div>
      <div class="mb-2">Inizio</div>
      <div>
        <StandardDatepicker
          placeholder="Inizio"
          bind:value={event.start}
        />
      </div>
      <div>
        <StandardTimePicker value={startTime} name="startTime" oninput={handleStartTimeChange} />
      </div>
    </div>
    <div>
      <div class="mb-2">Fine</div>
      <div>
        <StandardDatepicker
          placeholder="Fine"
          bind:value={event.end}
        />
      </div>
      <div>
        <StandardTimePicker value={endTime} name="endTime" oninput={handleEndTimeChange} />
      </div>
    </div>
  </div>
  <div class="w-full">
    <LabelAndTextfield 
      label="Titolo" 
      name="title" 
      bind:value={event.name} 
      --simple-textfield-width="100%"
    />
  </div>
  <div>
    <LabelAndTextarea label="Descrizione" name="description" bind:value={event.description} />
  </div>
	{#if mode == 'create' && teammates}
		<div style:margin-top="20px">
			<CollapsableSection title="Convocazioni">
				<button onclick={selectAll} class="text-[rgb(var(--global-color-primary-500))]"
					>Seleziona tutti</button
				>
        <button onclick={unselectAll} class="text-[rgb(var(--global-color-primary-500))] ml-2"
					>Deseleziona tutti</button
				>
				<TeammatesChecklist
					bind:value={convocations}
					bind:teammates
					bind:selectableGroups={groups}
					onlyConvocables={true}
				/>
			</CollapsableSection>
		</div>
	{/if}
</div>

<style>
	@media (max-width: 768px) {
    .duration-infos {
      --simple-textfield-width: 100%
    }
	}

	@media (min-width: 769px) {
	}
</style>
