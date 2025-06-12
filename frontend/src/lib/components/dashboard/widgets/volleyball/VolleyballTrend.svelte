<script lang="ts">
	import { run } from 'svelte/legacy'

	import ConfirmOrCancelButtons from '@/lib/components/common/ConfirmOrCancelButtons.svelte'
	import StandardAutocomplete from '@/lib/components/common/StandardAutocomplete.svelte'
	import StandardDialog from '@/lib/components/common/StandardDialog.svelte'
	import StandardSelect from '@/lib/components/common/StandardSelect.svelte'
	import StandardTextfield from '@/lib/components/common/StandardTextfield.svelte'
	import type { Widget } from '@/lib/services/dashboards/dashboard.service'
	import type { TeamFilter } from '@/lib/services/widgets/widgetSettings.service'
	import WidgetSettingsService from '@/lib/services/widgets/widgetSettings.service'
	import { LineChart, Icon, Skeleton } from '@likable-hair/svelte'
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import type { TrendResult } from '@/lib/services/scouts/scoutAnalysis.service'

	let dispatch = createEventDispatcher<{
		reload: undefined
	}>()

	interface Props {
		selectedSet?: number[]
		widget: Widget<{
			totalTrend: TrendResult
			trendForType: {
				[Key in 'block' | 'serve' | 'spike' | 'receive']?: TrendResult
			}
		}>
		loadingData?: boolean
	}

	let { selectedSet = [], widget, loadingData = false }: Props = $props()

	let data: ComponentProps<typeof LineChart>['data'] = $state({
		labels: [],
		datasets: []
	})

	run(() => {
		if (!!widget.data?.totalTrend) {
			data = {
				labels: [],
				datasets: []
			}

			data.datasets = [
				...data.datasets,
				{
					label: 'Totale',
					data: [],
					backgroundColor: 'rgb(239, 71, 110, .6)',
					borderColor: 'rgb(239, 71, 110, .6)',
					tension: 0.3,
					spanGaps: true
				}
			]

			let typeToColors: Record<string, string> = {
				block: '#d81159',
				serve: '#ffbc42',
				spike: '#0496ff',
				receive: '#006ba6'
			}

			for (const [key, value] of Object.entries(widget.data.trendForType)) {
				let type = key
				data.datasets = [
					...data.datasets,
					{
						label: type,
						data: [],
						backgroundColor: typeToColors[type],
						borderColor: typeToColors[type],
						tension: 0.3,
						spanGaps: true
					}
				]
			}

			for (let i = 0; i < widget.data.totalTrend.length; i += 1) {
				let trendRow = widget.data.totalTrend[i]
				data.labels = [...data.labels, '']

				data.datasets[0].data = [...data.datasets[0].data, trendRow.windowAverageRating]

				let datasetIndex = data.datasets.findIndex((d) => d.label === trendRow.type)
				if (datasetIndex === -1) continue

				let typeTrend = widget.data.trendForType[trendRow.type]
				if (!!typeTrend) {
					let rowIndex = typeTrend.findIndex((e) => e._id === trendRow._id)
					if (rowIndex !== -1) {
						data.datasets[datasetIndex].data = [
							...data.datasets[datasetIndex].data,
							typeTrend[rowIndex].windowAverageRating
						]
					}
				}

				for (let k = 0; k < data.datasets.length; k += 1) {
					if (data.datasets[k].label === trendRow.type) continue
					data.datasets[k].data = [...data.datasets[k].data, null]
				}
			}
		}
	})

	let settingsOpened: boolean = $state(false)
	let selectedTeamFilter: TeamFilter | undefined = $state(undefined)
	run(() => {
		selectedTeamFilter =
			widget.widgetSetting?.settings?.widget == 'VolleyballTrend'
				? widget.widgetSetting?.settings.team
				: undefined
	})
	let selectedType: ('block' | 'serve' | 'spike' | 'receive')[] | undefined = $state(undefined)
	run(() => {
		selectedType =
			widget.widgetSetting?.settings?.widget == 'VolleyballTrend'
				? widget.widgetSetting?.settings.type
				: undefined
	})
	let selectedWindow: number | undefined = $state(undefined)
	run(() => {
		selectedWindow =
			widget.widgetSetting?.settings?.widget == 'VolleyballTrend'
				? widget.widgetSetting?.settings.window
				: undefined
	})

	let loadingSaveSetting: boolean = $state(false)

	async function handleSaveSettings() {
		loadingSaveSetting = true
		let widgetSettingService = new WidgetSettingsService({ fetch })
		await widgetSettingService.set({
			widgetId: widget.id,
			settings: {
				widget: 'VolleyballTrend',
				team: selectedTeamFilter,
				type: selectedType,
				window: selectedWindow
			}
		})

		loadingSaveSetting = false
		dispatch('reload')
		settingsOpened = false
	}
</script>

<div class="@container w-full h-full rounded-md max-h-full">
	<div class="flex justify-between h-[24px]">
		<div class="text-lg font-bold">
			Trend {#if !!selectedType}
				({selectedType.join(', ')})
			{/if}
		</div>
		<div>
			<button onclick={() => (settingsOpened = true)}>
				<Icon name="mdi-cog"></Icon>
			</button>
		</div>
	</div>
	<div class="h-[calc(100%-24px)] w-full grid grid-cols-1 gap-3">
		<div class="p-2 min-h-[320px]">
			{#if loadingData}
				<Skeleton --skeleton-card-height="100%" --skeleton-card-width="100%"></Skeleton>
			{:else}
				<LineChart
					{data}
					showXTicks={false}
					showYTicks={false}
					lineWidth={2}
					gridLineWidth={0.3}
					maintainAspectRatio={false}
					enableZoom={false}
					yMax={102}
					yMin={0}
					showLegend={true}
					pointRadius={0}
					hitRadius={0}
					hoverRadius={0}
					tooltipsDisabled={false}
				></LineChart>
			{/if}
		</div>
	</div>
</div>

<StandardDialog title="Impostazioni" bind:open={settingsOpened}>
	<div class="py-2 min-w-[min(90vw,400px)]">
		<div class="flex flex-col gap-2">
			<div class="grid grid-cols-12 items-center">
				<div class="col-span-4">Visualizza</div>
				<div class="col-span-8">
					<StandardSelect
						options={[
							{ value: undefined, text: '' },
							{ value: 'friend', text: 'Amici' },
							{ value: 'opponent', text: 'Avversari' },
							{ value: 'both', text: 'Entrambi' }
						]}
						value={selectedTeamFilter}
						onchange={(e) => {
							// @ts-ignore
							let value = e.target.value
							selectedTeamFilter = value
						}}
					></StandardSelect>
				</div>
			</div>
			<div class="grid grid-cols-12 items-center">
				<div class="col-span-4">Fondamentale</div>
				<div class="col-span-8">
					<StandardAutocomplete
						items={[
							{ value: 'block', label: 'block' },
							{ value: 'serve', label: 'serve' },
							{ value: 'spike', label: 'spike' },
							{ value: 'receive', label: 'receive' }
						]}
						values={selectedType?.map((e) => ({ value: e, label: e })) || []}
						onchange={(e) => {
							// @ts-ignore
							selectedType = e.detail.selection.map((e) => e.value)
						}}
						multiple
						--autocomplete-background-color="rgb(var(--global-color-background-200))"
					></StandardAutocomplete>
				</div>
			</div>
			<div class="grid grid-cols-12 items-center">
				<div class="col-span-4">Finestra temporale</div>
				<div class="col-span-8">
					<StandardTextfield
						value={selectedWindow}
						type="number"
						oninput={(e) => {
							// @ts-ignore
							let value = e.target?.value
							selectedWindow = value === '' ? undefined : Number(value)
						}}
						--simple-textfield-background-color="rgb(var(--global-color-background-200))"
					></StandardTextfield>
				</div>
			</div>
			<div>
				<ConfirmOrCancelButtons
					bind:loading={loadingSaveSetting}
					on:confirm-click={handleSaveSettings}
					cancelText="Chiudi"
					on:cancel-click={() => (settingsOpened = false)}
				></ConfirmOrCancelButtons>
			</div>
		</div>
	</div>
</StandardDialog>
