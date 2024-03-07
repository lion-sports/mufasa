<script lang="ts" context="module">
	export type Event = {
		start?: Date
		end?: Date
		name?: string
		description?: string
	}

	import type { Teammate } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import StandardDatepicker from '$lib/components/common/StandardDatepicker.svelte'
	import StandardTimePicker from '$lib/components/common/StandardTimePicker.svelte'
	import { DateTime } from 'luxon'
	import LabelAndTextarea from '$lib/components/common/LabelAndTextarea.svelte'
	import TeammatesChecklist from '$lib/components/teammates/TeammatesChecklist.svelte'
	import CollapsableSection from '$lib/components/common/CollapsableSection.svelte'
	import type { Role } from '$lib/services/roles/roles.service'

	export let event: Event = {},
		convocations: {
			[key: number]: boolean
		} = {},
		mode: 'create' | 'update' = 'create',
		padding: string | undefined = undefined,
		margin: string | undefined = undefined,
		width: string | undefined = undefined,
		height: string | undefined = undefined,
		teammates: Teammate[] | undefined = undefined,
		roles: Role[] = []

	let date: Date | undefined = event.start,
		startTime: string,
		endTime: string

	$: {
		if (!event.start) {
			event.start = new Date()
		}

		if (!event.end) {
			event.end = DateTime.fromJSDate(event.start).plus({ hours: 1 }).toJSDate()
		}

		if (!!event.start) {
			startTime = DateTime.fromJSDate(new Date(event.start)).toFormat('HH:mm')
		}

		if (!!event.end) {
			endTime = DateTime.fromJSDate(new Date(event.end)).toFormat('HH:mm')
		}
	}

	function selectAll() {
		if (!!teammates) {
			convocations = {}
			for (let i = 0; i < teammates.filter((t) => !t.role || t.role.convocable).length; i += 1) {
				convocations[teammates[i].id] = true
			}
		}
	}

	function handleDatePickerClick(
		e: CustomEvent<{
			dateStat: {
				dayOfMonth: number
				dayOfWeek: number
				month: number
				year: number
			}
		}>
	) {
		let newDateStart = event.start
		if (!newDateStart) newDateStart = new Date()

		event.start = DateTime.fromJSDate(newDateStart)
			.set({
				month: e.detail.dateStat.month + 1,
				year: e.detail.dateStat.year,
				day: e.detail.dateStat.dayOfMonth
			})
			.toJSDate()

		let newDateEnd = event.end
		if (!newDateEnd) newDateEnd = new Date()

		event.end = DateTime.fromJSDate(newDateEnd)
			.set({
				month: e.detail.dateStat.month + 1,
				year: e.detail.dateStat.year,
				day: e.detail.dateStat.dayOfMonth
			})
			.toJSDate()
	}

	function handleDatePickerInput(
		e: CustomEvent<{
			datetime: Date | undefined
		}>
	) {
		if (!!e.detail.datetime) {
			let newDateStart = event.start
			if (!newDateStart) newDateStart = new Date()

			event.start = DateTime.fromJSDate(newDateStart)
				.set({
					month: e.detail.datetime.getMonth() + 1,
					year: e.detail.datetime.getFullYear(),
					day: e.detail.datetime.getDate()
				})
				.toJSDate()

			let newDateEnd = event.end
			if (!newDateEnd) newDateEnd = new Date()

			event.end = DateTime.fromJSDate(newDateEnd)
				.set({
					month: e.detail.datetime.getMonth() + 1,
					year: e.detail.datetime.getFullYear(),
					day: e.detail.datetime.getDate()
				})
				.toJSDate()
		}
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
	<div class="duration-infos">
		<div>
			<StandardDatepicker
				placeholder="Data "
				bind:value={date}
				on:day-click={handleDatePickerClick}
				on:input={handleDatePickerInput}
			/>
		</div>
		<div>
			<StandardTimePicker value={startTime} name="startTime" on:input={handleStartTimeChange} />
		</div>
		<div>
			<StandardTimePicker value={endTime} name="endTime" on:input={handleEndTimeChange} />
		</div>
	</div>
	<LabelAndTextfield label="Titolo" name="title" bind:value={event.name} />
	<LabelAndTextarea label="Descrizione" name="description" bind:value={event.description} />
	{#if mode == 'create' && teammates}
		<div style:margin-top="20px">
			<CollapsableSection title="Convocazioni">
				<button on:click={selectAll} style:color="rgb(var(--global-color-primary-500))"
					>Seleziona tutti</button
				>
				<TeammatesChecklist
					bind:value={convocations}
					bind:teammates
					bind:selectableRoles={roles}
					onlyConvocables={true}
				/>
			</CollapsableSection>
		</div>
	{/if}
</div>

<style>
	@media (max-width: 768px) {
	}

	@media (min-width: 769px) {
	}

	.duration-infos {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
</style>
