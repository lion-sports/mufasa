<script lang="ts">
	import { run } from 'svelte/legacy'

	import type { ScoringSystem } from '$lib/services/scoringSystems/scoringSystems.service'
	import LabelAndTextfield from '../common/LabelAndTextfield.svelte'
	import ScoutSportAutocomplete from '../scouts/ScoutSportAutocomplete.svelte'
	import LabelAndCheckbox from '../common/LabelAndCheckbox.svelte'
	import ButtonGroup from '../common/ButtonGroup.svelte'
	import { Icon } from '@likable-hair/svelte'

	interface Props {
		scoringSystem?: DeepPartial<ScoringSystem>
		formValid?: boolean
	}

	let { scoringSystem = $bindable({}), formValid = $bindable(false) }: Props = $props()

	let selectedSports = $derived(
		!!scoringSystem.sport
			? [
					{
						value: scoringSystem.sport,
						label: scoringSystem.sport
					}
				]
			: []
	)

	run(() => {
		if (!scoringSystem.config) scoringSystem.config = {}
	})
	run(() => {
		if (!!scoringSystem.config && !scoringSystem.config.set) scoringSystem.config.set = {}
	})
	run(() => {
		if (!!scoringSystem.config && !scoringSystem.config.points) scoringSystem.config.points = {}
	})

	run(() => {
		formValid =
			!!scoringSystem.name &&
			!!scoringSystem.sport &&
			!!scoringSystem.config &&
			!!scoringSystem.config.set &&
			!!scoringSystem.config.set.mode &&
			((scoringSystem.config.set.mode == 'totalSet' && !!scoringSystem.config.set.totalSets) ||
				(scoringSystem.config.set.mode == 'winSet' && !!scoringSystem.config.set.winSets)) &&
			!!scoringSystem.config.points &&
			((scoringSystem.config.points.mode == 'totalPoints' &&
				!!scoringSystem.config.points.totalPoints) ||
				(scoringSystem.config.points.mode == 'winPoints' &&
					!!scoringSystem.config.points.winPoints))
	})
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap gap-2">
		<div>
			<LabelAndTextfield label="Nome" name="name" bind:value={scoringSystem.name}
			></LabelAndTextfield>
		</div>

		<div class="">
			<div class="mb-1">Sport</div>
			<ScoutSportAutocomplete
				bind:values={selectedSports}
				onchange={(e) => {
					if (selectedSports.length > 0) scoringSystem.sport = selectedSports[0].value
					else scoringSystem.sport = undefined
				}}
			></ScoutSportAutocomplete>
		</div>
	</div>

	<div>
		<LabelAndCheckbox bind:value={scoringSystem.public} id="public" label="Pubblico"
		></LabelAndCheckbox>
	</div>

	{#if !!scoringSystem.config?.set}
		<div class="font-bold mt-6">Sistema Set</div>
		<div class="flex mt-2">
			<ButtonGroup
				buttons={[
					{
						value: 'totalSet',
						label: 'Set totali',
						icon: 'mdi-trending-neutral',
						description: 'Si giocano un numero di set prestabiliti.'
					},
					{
						value: 'winSet',
						label: 'Set per vincere',
						icon: 'mdi-trending-up',
						description: 'Per vincere occorre fare un numero di set precisi.'
					}
				]}
				bind:selectedButton={scoringSystem.config.set.mode}
			>
				{#snippet children({ button })}
					<div class="flex gap-4 text-left items-center">
						<div class="text-4xl">
							<Icon name={button.icon}></Icon>
						</div>
						<div>
							<div class="text-2xl">
								{button.label}
							</div>
							<div class="mt-2 font-light">
								{button.description}
							</div>
						</div>
					</div>
				{/snippet}
			</ButtonGroup>
		</div>

		{#if scoringSystem.config?.set?.mode == 'totalSet'}
			<div class="mt-4">
				<LabelAndTextfield
					label="Numero set da giocare"
					name="total-sets"
					type="number"
					bind:value={scoringSystem.config.set.totalSets}
				></LabelAndTextfield>
			</div>
		{:else if scoringSystem.config?.set?.mode == 'winSet'}
			<div class="mt-4">
				<LabelAndTextfield
					label="Numero set per vincere"
					name="win-sets"
					type="number"
					bind:value={scoringSystem.config.set.winSets}
				></LabelAndTextfield>
			</div>
		{/if}
	{/if}

	{#if scoringSystem.config?.points}
		<div class="font-bold mt-6">Sistema Punti</div>
		<ButtonGroup
			buttons={[
				{
					value: 'totalPoints',
					label: 'Punti totali',
					icon: 'mdi-trending-neutral',
					description: 'Si giocano un numero di punti totali prestabiliti.'
				},
				{
					value: 'winPoints',
					label: 'Punti per vincere',
					icon: 'mdi-trending-up',
					description: 'Per vincere occorre fare un numero di punti precisi.'
				}
			]}
			bind:selectedButton={scoringSystem.config.points.mode}
		>
			{#snippet children({ button })}
				<div class="flex gap-4 text-left items-center">
					<div class="text-4xl">
						<Icon name={button.icon}></Icon>
					</div>
					<div>
						<div class="text-2xl">
							{button.label}
						</div>
						<div class="mt-2 font-light">
							{button.description}
						</div>
					</div>
				</div>
			{/snippet}
		</ButtonGroup>

		{#if scoringSystem.config?.points?.mode == 'totalPoints'}
			<div class="mt-4">
				<LabelAndTextfield
					label="Numero punti da giocare"
					name="total-points"
					type="number"
					bind:value={scoringSystem.config.points.totalPoints}
				></LabelAndTextfield>
			</div>
		{:else if scoringSystem.config?.points?.mode == 'winPoints'}
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<LabelAndTextfield
						label="Numero punti per vincere"
						name="win-points"
						type="number"
						bind:value={scoringSystem.config.points.winPoints}
					></LabelAndTextfield>
				</div>
				<div>
					<LabelAndCheckbox
						bind:value={scoringSystem.config.points.hasAdvantages}
						id="has-advantages"
						label="Ha i vantaggi"
					></LabelAndCheckbox>
				</div>
				{#if scoringSystem.config.points.hasAdvantages}
					<div>
						<LabelAndTextfield
							label="Punti limite"
							name="points-limit"
							type="number"
							bind:value={scoringSystem.config.points.pointsLimit}
						></LabelAndTextfield>
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	<div class="font-bold mt-6">Tie break</div>
	<div>
		<LabelAndCheckbox
			value={!!scoringSystem.config?.tieBreak}
			id="has-tie-break"
			label="Ha tie break"
			onchange={(e) => {
				// @ts-ignore
				let checked = e.target.checked
				if (checked) {
					if (!scoringSystem.config) scoringSystem.config = {}
					scoringSystem.config.tieBreak = {}
				} else {
					if (!!scoringSystem.config) scoringSystem.config.tieBreak = undefined
				}
			}}
		></LabelAndCheckbox>
	</div>

	{#if !!scoringSystem.config?.tieBreak}
		<div class="mt-2">
			<ButtonGroup
				buttons={[
					{
						value: 'totalPoints',
						label: 'Punti totali',
						icon: 'mdi-trending-neutral',
						description: 'Si giocano un numero di punti totali prestabiliti.'
					},
					{
						value: 'winPoints',
						label: 'Punti per vincere',
						icon: 'mdi-trending-up',
						description: 'Per vincere occorre fare un numero di punti precisi.'
					}
				]}
				bind:selectedButton={scoringSystem.config.tieBreak.mode}
			>
				{#snippet children({ button })}
					<div class="flex gap-4 text-left items-center">
						<div class="text-4xl">
							<Icon name={button.icon}></Icon>
						</div>
						<div>
							<div class="text-2xl">
								{button.label}
							</div>
							<div class="mt-2 font-light">
								{button.description}
							</div>
						</div>
					</div>
				{/snippet}
			</ButtonGroup>

			{#if scoringSystem.config?.tieBreak?.mode == 'totalPoints'}
				<div class="mt-4">
					<LabelAndTextfield
						label="Numero punti da giocare"
						name="total-points"
						type="number"
						bind:value={scoringSystem.config.tieBreak.totalPoints}
					></LabelAndTextfield>
				</div>
			{:else if scoringSystem.config?.tieBreak?.mode == 'winPoints'}
				<div class="mt-4 flex flex-col gap-4">
					<div>
						<LabelAndTextfield
							label="Numero punti per vincere"
							name="win-points"
							type="number"
							bind:value={scoringSystem.config.tieBreak.winPoints}
						></LabelAndTextfield>
					</div>
					<div>
						<LabelAndCheckbox
							bind:value={scoringSystem.config.tieBreak.hasAdvantages}
							id="has-advantages"
							label="Ha i vantaggi"
						></LabelAndCheckbox>
					</div>
					{#if scoringSystem.config.tieBreak.hasAdvantages}
						<div>
							<LabelAndTextfield
								label="Punti limite"
								name="points-limit"
								type="number"
								bind:value={scoringSystem.config.tieBreak.pointsLimit}
							></LabelAndTextfield>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
