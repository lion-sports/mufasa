<script lang="ts">
	import ValueChangeIndicator from '@/lib/components/common/ValueChangeIndicator.svelte'
	import type { Widget } from '@/lib/services/dashboards/dashboard.service'
	import WidgetSettingsService from '@/lib/services/widgets/widgetSettings.service'
	import { Icon, Skeleton } from '@likable-hair/svelte'
	import type { VolleyballPoints } from 'lionn-common'
	import { createEventDispatcher } from 'svelte'

	let dispatch = createEventDispatcher<{
		reload: undefined
	}>()

	interface Props {
		selectedSet?: number[]
		widget: Widget<{
			points: VolleyballPoints[]
		}>
		loadingData?: boolean
	}

	let { selectedSet = [], widget, loadingData = false }: Props = $props()

	let settingsOpened: boolean = $state(false)
	let loadingSaveSetting: boolean = false

	async function handleSaveSettings() {
		loadingSaveSetting = true
		let widgetSettingService = new WidgetSettingsService({ fetch })
		await widgetSettingService.set({
			widgetId: widget.id,
			settings: {
				widget: 'VolleyballServeSummary'
			}
		})

		loadingSaveSetting = false
		dispatch('reload')
		settingsOpened = false
	}
</script>

<div class="@container w-full h-full rounded-md max-h-full">
	<div class="flex justify-between h-[24px]">
		<div class="text-lg font-bold">Points history</div>
		<div>
			<button onclick={() => (settingsOpened = true)}>
				<Icon name="mdi-cog"></Icon>
			</button>
		</div>
	</div>
	<div class="h-[calc(100%-32px)] w-full max-h-[400px] overflow-auto">
		{#if loadingData}
			<Skeleton --skeleton-card-height="100%" --skeleton-card-width="100%"></Skeleton>
		{:else}
			<div class="grid grid-cols-2 mt-4 text-lg font-semibold gap-8 h-[24px]">
				<div class="text-right">Amici</div>
				<div class="text-left">Avversari</div>
			</div>
			<div class="flex flex-col gap-2 overflow-auto h-[calc(100%-24px)]">
				{#if !!widget.data?.points}
					{#each widget.data.points as pointSpec}
						{@const friendSideDifference = pointSpec.friends.points - pointSpec.enemy.points}
						{@const opponentSideDifference = pointSpec.enemy.points - pointSpec.friends.points}
						{#if pointSpec.friends.points == 0 && pointSpec.enemy.points == 0}
							<div class="grid grid-cols-2 mt-4 text-3xl font-semibold gap-8">
								<div class="text-center">{pointSpec.friends.sets}</div>
								<div class="text-center">{pointSpec.enemy.sets}</div>
							</div>
						{:else}
							<div class="grid grid-cols-4 mt-4 font-semibold gap-8">
								<div class="text-right">
									<ValueChangeIndicator difference={friendSideDifference} showIcon={false}
									></ValueChangeIndicator>
								</div>
								<div class="text-right">{pointSpec.friends.points}</div>
								<div class="text-left">{pointSpec.enemy.points}</div>
								<div class="text-left">
									<ValueChangeIndicator difference={opponentSideDifference} showIcon={false}
									></ValueChangeIndicator>
								</div>
							</div>
						{/if}
					{/each}
				{:else}
					<div class="flex justify-center items-center h-[200px] font-light font-sm">
						Nessun dato
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
