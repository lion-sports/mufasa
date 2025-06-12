<script lang="ts">
	import { run } from 'svelte/legacy'

	import ConfirmOrCancelButtons from '@/lib/components/common/ConfirmOrCancelButtons.svelte'
	import StandardDialog from '@/lib/components/common/StandardDialog.svelte'
	import StandardSelect from '@/lib/components/common/StandardSelect.svelte'
	import ValueChangeIndicator from '@/lib/components/common/ValueChangeIndicator.svelte'
	import PlayerMarker from '@/lib/components/scouts/PlayerMarker.svelte'
	import type { Widget } from '@/lib/services/dashboards/dashboard.service'
	import type {
		TotalServeByPlayerResult,
		TotalServeResult,
		TotalSpikeForPlayerAndPositionResult,
		TotalSpikeForPlayerResult,
		TotalSpikeForPositionResult
	} from '@/lib/services/scouts/scoutAnalysis.service'
	import TeammatesService from '@/lib/services/teammates/teammates.service'
	import type { TeamFilter } from '@/lib/services/widgets/widgetSettings.service'
	import WidgetSettingsService from '@/lib/services/widgets/widgetSettings.service'
	import { BarChart, HorizontalStackedProgress, Icon, Skeleton, theme } from '@likable-hair/svelte'
	import { createEventDispatcher, type ComponentProps } from 'svelte'

	let dispatch = createEventDispatcher<{
		reload: undefined
	}>()

	interface Props {
		selectedSet?: number[]
		widget: Widget<{
			totalServe: TotalServeResult
			totalServeByPlayer: TotalServeByPlayerResult
			previousTotalServeByPlayer: TotalServeByPlayerResult
		}>
		loadingData?: boolean
	}

	let { selectedSet = [], widget, loadingData = false }: Props = $props()

	let data: ComponentProps<typeof BarChart>['data'] = $derived.by(() => {
    let data: ComponentProps<typeof BarChart>['data'] = undefined

    if (!!widget.data?.totalServe) {
			data = {
				labels: ['Punti', 'Errori', 'Ricevuti'],
				datasets: []
			}

			if (!setting || setting?.team == 'both' || setting?.team == 'friend') {
				data.datasets = [
					...data.datasets,
					{
						label: 'Amici',
						data: [],
						backgroundColor: 'rgb(59, 130, 246, .6)',
						borderColor: 'rgb(59, 130, 246, .6)',
						tension: 0.3
					}
				]
			}

			if (!setting || setting?.team == 'both' || setting?.team == 'opponent') {
				data.datasets = [
					...data.datasets,
					{
						label: 'Avversari',
						data: [],
						backgroundColor: 'rgb(239, 68, 68, .6)',
						borderColor: 'rgb(239, 68, 68, .6)',
						tension: 0.3
					}
				]
			}

			for (let i = 0; i < widget.data.totalServe.length; i += 1) {
				let totalServeRow = widget.data.totalServe[i]

				let datasetIndex = -1
				if (totalServeRow.opponent) {
					datasetIndex = data.datasets.findIndex((d) => d.label == 'Avversari')
				} else {
					datasetIndex = data.datasets.findIndex((d) => d.label == 'Amici')
				}

				if (datasetIndex === -1) continue

				let received =
					totalServeRow.total - (totalServeRow.points || 0) - (totalServeRow.errors || 0)
				data.datasets[datasetIndex].data = [totalServeRow.points, totalServeRow.errors, received]
			}
		}

    return data
  })

	let setting = $derived(
		widget.widgetSetting?.settings?.widget == 'VolleyballServeSummary'
			? widget.widgetSetting?.settings
			: undefined
	)

	let settingsOpened: boolean = $state(false)
	let selectedTeamFilter: TeamFilter | undefined = $state(undefined)
	run(() => {
		selectedTeamFilter =
			widget.widgetSetting?.settings?.widget == 'VolleyballServeSummary'
				? widget.widgetSetting?.settings.team
				: undefined
	})

	let loadingSaveSetting: boolean = $state(false)

	async function handleSaveSettings() {
		loadingSaveSetting = true
		let widgetSettingService = new WidgetSettingsService({ fetch })
		await widgetSettingService.set({
			widgetId: widget.id,
			settings: {
				widget: 'VolleyballServeSummary',
				team: selectedTeamFilter
			}
		})

		loadingSaveSetting = false
		dispatch('reload')
		settingsOpened = false
	}
</script>

<div class="@container w-full h-full rounded-md max-h-full">
	<div class="flex justify-between h-[24px]">
		<div class="text-lg font-bold">Serve summary</div>
		<div>
			<button onclick={() => (settingsOpened = true)}>
				<Icon name="mdi-cog"></Icon>
			</button>
		</div>
	</div>
	<div class="h-[calc(100%-24px)] w-full grid grid-cols-1 @md:grid-cols-12 gap-3">
		<div class="@md:col-span-6 p-2 min-h-[320px]">
			{#if loadingData}
				<Skeleton --skeleton-card-height="100%" --skeleton-card-width="100%"></Skeleton>
			{:else}
				<BarChart
					data={data}
					rgbTooltipBackgroundColor={$theme.colors?.[$theme.active]['dark']['background']['200']}
					rgbTooltipColor={$theme.colors?.[$theme.active]['dark']['contrast']['200']}
					showLegend={false}
					showXTicks={true}
					showYTicks={true}
					lineWidth={0}
					maintainAspectRatio={false}
				></BarChart>
			{/if}
		</div>
		<div class="@md:col-span-6 p-2 @md:h-[350px]">
			{#if loadingData}
				<div class="flex flex-col gap-4">
					{#each Array.from(Array(3).keys()) as i}
						<div class="flex flex-col gap-2">
							<Skeleton --skeleton-card-height="32px" --skeleton-card-width="100%"></Skeleton>
							<Skeleton --skeleton-card-height="24px" --skeleton-card-width="64%"></Skeleton>
						</div>
					{/each}
				</div>
			{:else if !!widget.data?.totalServeByPlayer && widget.data.totalServeByPlayer.length > 0}
				<div class="flex flex-col gap-2 h-full overflow-auto">
					{#each widget.data.totalServeByPlayer as playerStats}
						{@const previousStat = widget.data.previousTotalServeByPlayer.find(
							(e) => e.player.id == playerStats.player.id
						)}
						{@const previousStatPointsPercentageDifference = Number(
							(playerStats.pointsPercentage - (previousStat?.pointsPercentage || 0)).toFixed(0)
						)}
						{@const previousStatErrorsPercentageDifference = Number(
							(playerStats.errorsPercentage - (previousStat?.errorsPercentage || 0)).toFixed(0)
						)}
						{@const previousStatPointsDifference = Number(
							(playerStats.points - (previousStat?.points || 0)).toFixed(0)
						)}
						<div class="flex gap-2">
							<div>
								<PlayerMarker
									friend={!playerStats.player.isOpponent}
									opponent={playerStats.player.isOpponent}
									libero={playerStats.player.role == 'libero'}
									>{playerStats.player.shirtNumber}</PlayerMarker
								>
							</div>
							<div class="flex flex-col flex-grow">
								<div class="flex gap-2 mb-2">
									<div class="font-semibold text-lg flex-grow">
										{TeammatesService.getTeammateName({
											player: playerStats.player,
											teammate: playerStats.player.teammate
										})}
									</div>
									<div></div>
								</div>
								<div class="mb-2">
									<HorizontalStackedProgress
										progresses={[
											{
												label: 'Punti',
												value: playerStats.points,
												color: 'rgb(34 197 94)'
											},
											{
												label: 'Errori',
												value: playerStats.errors,
												color: 'rgb(var(--global-color-error-500))'
											},
											{
												label: 'Ricevuti',
												value: playerStats.total - playerStats.points - playerStats.errors,
												color: 'grey'
											}
										]}
										legendVisible={false}
										labelVisible={false}
									/>
								</div>
								<div class="grid grid-cols-2">
									<div class="flex flex-col gap-1">
										<div class="font-light mb-1">
											# {playerStats.total}
										</div>
										<div class="mb-1 flex gap-2">
											Punti: {playerStats.points}
											{#if previousStat !== undefined}
												<ValueChangeIndicator difference={previousStatPointsDifference}
												></ValueChangeIndicator>
											{/if}
										</div>
										<div class="mb-1">
											Errori: {playerStats.errors}
										</div>
									</div>
									<div class="flex flex-col gap-1">
										<div class="mb-1 flex gap-2">
											% Punti (su sq.): {playerStats.pointsPercentage.toFixed(2)}
											{#if previousStat !== undefined}
												<ValueChangeIndicator difference={previousStatPointsPercentageDifference}
												></ValueChangeIndicator>
											{/if}
										</div>
										<div class="mb-1 flex gap-2">
											% Errori (su sq.): {playerStats.errorsPercentage.toFixed(2)}
											{#if previousStat !== undefined}
												<ValueChangeIndicator
													difference={previousStatErrorsPercentageDifference}
													invertPositivity
												></ValueChangeIndicator>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="h-full w-full flex flex-col justify-center items-center">
					<div class="text-xs font-light">Nessun dato</div>
				</div>
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
