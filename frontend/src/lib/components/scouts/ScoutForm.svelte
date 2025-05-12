<script lang="ts">
	import type { ScoringSystem } from '$lib/services/scoringSystems/scoringSystems.service'
	import type { Scout } from '$lib/services/scouts/scouts.service'
	import { DatePickerTextField } from '@likable-hair/svelte'
	import LabelAndTextfield from '../common/LabelAndTextfield.svelte'
	import ScoringSystemAsyncAutocomplete from '../scoringSystems/ScoringSystemAsyncAutocomplete.svelte'
	import ScoutSportAutocomplete from '../common/SportAutocomplete.svelte'

	interface Props {
		scout?: Partial<Scout>
		scoringSystems?: ScoringSystem[]
	}

	let { scout = $bindable({}), scoringSystems = [] }: Props = $props()

	let selectedSports = $derived(
		!!scout.sport
			? [
					{
						value: scout.sport,
						label: scout.sport
					}
				]
			: []
	)

	let selectedScoringSystem = $derived(
		!!scout.scoringSystem
			? [
					{
						value: scout.scoringSystem.id?.toString(),
						label: scout.scoringSystem.name
					}
				]
			: []
	)
</script>

<div class="flex flex-wrap gap-2">
	<div class="">
		<div class="mb-1">Sport</div>
		<ScoutSportAutocomplete
			bind:values={selectedSports}
			onchange={(e) => {
				if (selectedSports.length > 0) scout.sport = selectedSports[0].value
				else scout.sport = undefined
			}}
		></ScoutSportAutocomplete>
	</div>

	<div class="">
		<div class="mb-1">Sistema di punteggio</div>
		<ScoringSystemAsyncAutocomplete
			values={selectedScoringSystem}
			{scoringSystems}
			onchange={(event) => {
				if (
					!!event.detail.selection &&
					event.detail.selection.length > 0 &&
					!!event.detail.selection[0].value
				) {
					scout.scoringSystem = event.detail.selection[0].data?.scoringSystem
					scout.scoringSystemId = Number(event.detail.selection[0].value)
				} else {
					scout.scoringSystem = undefined
					scout.scoringSystemId = undefined
				}
			}}
		></ScoringSystemAsyncAutocomplete>
	</div>

	<div class="">
		<LabelAndTextfield label="Nome" bind:value={scout.name} name="name"></LabelAndTextfield>
	</div>

	<div class="">
		<div class="mb-1">Data inizio</div>
		<DatePickerTextField bind:selectedDate={scout.startedAt} placeholder="Data inizio"
		></DatePickerTextField>
	</div>
</div>
