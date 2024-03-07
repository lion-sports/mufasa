<script lang="ts">
	import type { Team } from '$lib/services/teams/teams.service'
	import type { Event } from '$lib/services/events/events.service'
	import type { Option } from '$lib/components/common/StandardSelect.svelte'
	import { DateTime } from 'luxon'
	import EventsService from '$lib/services/events/events.service'
	import { createEventDispatcher } from 'svelte'
	import StandardDialog from '$lib/components/common/StandardDialog.svelte'
	import StandardSelect from '$lib/components/common/StandardSelect.svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import ConfirmOrCancelButtons from '../common/ConfirmOrCancelButtons.svelte'

	let dispatch = createEventDispatcher<{
		import: {
			events: Event[]
		}
	}>()

	export let open: boolean = false,
		team: Team,
		selectedYear: number = DateTime.now().get('weekYear'),
		selectedWeek: number,
		toYear: number,
		toWeek: number,
		title: string = 'Importa settimana'

	let weeksItems: Option[] = [],
		selectedYearString: string = selectedYear.toString()
	$: {
		weeksItems = []

		if (
			!isNaN(parseInt(selectedYearString)) &&
			parseInt(selectedYearString) !== undefined &&
			parseInt(selectedYearString) !== null
		) {
			selectedYear = parseInt(selectedYearString)
			let loopingYear: number = parseInt(selectedYearString)
			let loopingDate: DateTime = DateTime.fromObject({
				weekYear: parseInt(selectedYearString),
				weekNumber: 1,
				weekday: 1
			})

			while (loopingYear == parseInt(selectedYearString)) {
				let firstDayOfWeek = DateTime.fromObject({
					weekday: 1,
					weekNumber: loopingDate.get('weekNumber'),
					weekYear: loopingYear
				})
					.setLocale('it')
					.toLocaleString({
						day: 'numeric',
						month: 'short'
					})

				let lastDayOfWeek = DateTime.fromObject({
					weekday: 7,
					weekNumber: loopingDate.get('weekNumber'),
					weekYear: loopingYear
				})
					.setLocale('it')
					.toLocaleString({
						day: 'numeric',
						month: 'short'
					})

				let label = `${firstDayOfWeek} - ${lastDayOfWeek} ${loopingYear} (${loopingDate.get(
					'weekNumber'
				)})`
				let value = loopingDate.get('weekNumber')

				weeksItems.push({
					text: label,
					value: value
				})
				loopingDate = loopingDate.set({ weekNumber: loopingDate.get('weekNumber') + 1 })
				loopingYear = loopingDate.get('weekYear')
			}

			weeksItems = [...weeksItems]
		}
	}

	let importLoading: boolean = false
	async function handleConfirmation() {
		if (!selectedWeek || !selectedYear) return

		importLoading = true
		let service = new EventsService({ fetch })
		let events = await service.copyWeek({
			fromWeekNumber: selectedWeek,
			fromWeekYear: selectedYear,
			toWeekNumber: toWeek,
			toWeekYear: toYear,
			team: team
		})

		dispatch('import', {
			events
		})

		importLoading = false
		open = false
	}

	function handleCancelation() {
		open = false
	}
</script>

<StandardDialog bind:open {title}>
	<LabelAndTextfield label="Anno" name="year" bind:value={selectedYearString} />
	<StandardSelect bind:value={selectedWeek} options={weeksItems} />
	<ConfirmOrCancelButtons
		confirmText="Importa"
		loading={importLoading}
		on:confirm-click={handleConfirmation}
		on:cancel-click={handleCancelation}
	/>
</StandardDialog>
