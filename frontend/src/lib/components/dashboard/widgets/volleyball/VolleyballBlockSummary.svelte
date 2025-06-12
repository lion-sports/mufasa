<script lang="ts">
	import { run } from 'svelte/legacy'

	import ApplicationLogo from '@/lib/components/common/ApplicationLogo.svelte'
	import ConfirmOrCancelButtons from '@/lib/components/common/ConfirmOrCancelButtons.svelte'
	import StandardDialog from '@/lib/components/common/StandardDialog.svelte'
	import StandardSelect from '@/lib/components/common/StandardSelect.svelte'
	import ValueChangeIndicator from '@/lib/components/common/ValueChangeIndicator.svelte'
	import PlayerMarker from '@/lib/components/scouts/PlayerMarker.svelte'
	import type { Widget } from '@/lib/services/dashboards/dashboard.service'
	import type {
		TotalBlockByPlayerResult,
		TotalBlockResult,
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
			totalBlock: TotalBlockResult
			totalBlockByPlayer: TotalBlockByPlayerResult
			previousTotalBlockByPlayer: TotalBlockByPlayerResult
		}>
		loadingData?: boolean
	}

	let { selectedSet = [], widget, loadingData = false }: Props = $props()

	let data: ComponentProps<typeof BarChart>['data'] = $state({
		labels: [],
		datasets: []
	})

	let setting = $derived(
		widget.widgetSetting?.settings?.widget == 'VolleyballServeSummary'
			? widget.widgetSetting?.settings
			: undefined
	)

	run(() => {
		if (!!widget.data?.totalBlock) {
			data = {
				labels: ['Punti', 'Mani Out', 'Tocco e ritorno', 'Tocchi'],
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

			for (let i = 0; i < widget.data.totalBlock.length; i += 1) {
				let totalBlockRow = widget.data.totalBlock[i]

				let datasetIndex = -1
				if (totalBlockRow.opponent) {
					datasetIndex = data.datasets.findIndex((d) => d.label == 'Avversari')
				} else {
					datasetIndex = data.datasets.findIndex((d) => d.label == 'Amici')
				}

				if (datasetIndex === -1) continue

				data.datasets[datasetIndex].data = [
					totalBlockRow.points,
					totalBlockRow.handsOut,
					totalBlockRow.putBack,
					totalBlockRow.touch
				]
			}
		}
	})

	let settingsOpened: boolean = $state(false)
	let selectedTeamFilter: TeamFilter | undefined = $state(undefined)
	run(() => {
		selectedTeamFilter =
			widget.widgetSetting?.settings?.widget == 'VolleyballBlockSummary'
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
				widget: 'VolleyballBlockSummary',
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
		<div class="text-lg font-bold">Block summary</div>
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
					{data}
					rgbTooltipBackgroundColor={$theme.colors?.[$theme.active]['dark']['background']['200']}
					rgbTooltipColor={$theme.colors?.[$theme.active]['dark']['contrast']['200']}
					showLegend={false}
					showXTicks={true}
					showYTicks={true}
					lineWidth={0}
					maintainAspectRatio={false}
					xTickLabel={(value) => {
						return ['Punti', 'Mani Out', 'Tocco e ritorno', 'Tocchi'][Number(value)]
					}}
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
			{:else if !!widget.data?.totalBlockByPlayer && widget.data.totalBlockByPlayer.length > 0}
				<div class="flex flex-col gap-2 h-full overflow-auto">
					{#each widget.data.totalBlockByPlayer as playerStats}
						{@const previousStat = widget.data.previousTotalBlockByPlayer.find(
							(e) => e.player.id == playerStats.player.id
						)}
						{@const previousStatPointsPercentageDifference = Number(
							(playerStats.pointsPercentage - (previousStat?.pointsPercentage || 0)).toFixed(0)
						)}
						{@const previousStatHandsOutPercentageDifference = Number(
							(playerStats.handsOutPercentage - (previousStat?.handsOutPercentage || 0)).toFixed(0)
						)}
						{@const previousStatPutBackPercentageDifference = Number(
							(playerStats.putBackPercentage - (previousStat?.putBackPercentage || 0)).toFixed(0)
						)}
						{@const previousStatTouchPercentageDifference = Number(
							(playerStats.touchPercentage - (previousStat?.touchPercentage || 0)).toFixed(0)
						)}
						{@const previousStatPointsDifference = Number(
							(playerStats.points - (previousStat?.points || 0)).toFixed(0)
						)}
						{@const previousStatHandsOutDifference = Number(
							(playerStats.handsOut - (previousStat?.handsOut || 0)).toFixed(0)
						)}
						{@const previousStatPutBackDifference = Number(
							(playerStats.putBack - (previousStat?.putBack || 0)).toFixed(0)
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
												value: playerStats.points || 0,
												color: 'rgb(34 197 94)'
											},
											{
												label: 'Tocchi e ritorno',
												value: playerStats.putBack || 0,
												color: 'rgb(144 176 48 / 56%)'
											},
											{
												label: 'Mani out',
												value: playerStats.handsOut || 0,
												color: 'rgb(var(--global-color-error-500))'
											},
											{
												label: 'Tocchi',
												value: playerStats.touch || 0,
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
										<div class="mb-1 flex gap-2">
											Mani out: {playerStats.handsOut}
											{#if previousStat !== undefined}
												<ValueChangeIndicator
													difference={previousStatHandsOutDifference}
													invertPositivity
												></ValueChangeIndicator>
											{/if}
										</div>
										<div class="mb-1 flex gap-2">
											Tocchi e ritorno: {playerStats.putBack || 0}
										</div>
										<div class="mb-1 flex gap-2">
											Tocchi: {playerStats.touch || 0}
										</div>
									</div>
									<div class="flex flex-col gap-1">
										<div class="mb-1 flex gap-2">
											% Punti (su sq.): {playerStats.pointsPercentage?.toFixed(2) || 0}
											{#if previousStat !== undefined}
												<ValueChangeIndicator difference={previousStatPointsPercentageDifference}
												></ValueChangeIndicator>
											{/if}
										</div>
										<div class="mb-1 flex gap-2">
											% Mani out (su sq.): {playerStats.handsOutPercentage?.toFixed(2) || 0}
											{#if previousStat !== undefined}
												<ValueChangeIndicator
													difference={previousStatHandsOutPercentageDifference}
													invertPositivity
												></ValueChangeIndicator>
											{/if}
										</div>
										<div class="mb-1 flex gap-2">
											% Tocchi e ritorno (su sq.): {playerStats.putBackPercentage?.toFixed(2) || 0}
											{#if previousStat !== undefined}
												<ValueChangeIndicator difference={previousStatPutBackPercentageDifference}
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
