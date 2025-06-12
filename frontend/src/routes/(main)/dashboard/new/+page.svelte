<script lang="ts">
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import DashboardEditor from '$lib/components/dashboard/DashboardEditor.svelte'
	import type { Widget } from '$lib/services/dashboards/dashboard.service'
	import DashboardService from '$lib/services/dashboards/dashboard.service'

	let { data } = $props()

	let someRowSlotEmpty: boolean = $state(false),
		widgets: Widget[] = $state([]),
		dashboardName: string = $state('New dashboard'),
		loadingSave: boolean = $state(false)

	let valid = $derived(!someRowSlotEmpty && widgets.length > 0 && !!dashboardName)

	async function saveDashboard() {
		loadingSave = true

		let service = new DashboardService({ fetch })
		await service.create({
			name: dashboardName,
			active: true,
			widgets
		})

		loadingSave = false
		window.history.back()
	}
</script>

<PageTitle title="New dashboard" prependVisible>
	{#snippet titleSnippet()}
		<div class="flex justify-between items-center mobile-wrap gap-2">
			<input
				type="text"
				class="border-none bg-transparent outline-none
					focus:bg-[rgb(var(--global-color-primary-500),.2)] rounded-md px-3
					w-full
					"
				bind:value={dashboardName}
			/>
			<StandardButton
				disabled={!valid}
				loading={loadingSave}
				on:click={saveDashboard}
				--button-font-size="0.9rem"
				--button-font-weight="400"
			>
				<span class="mr-2"><Icon name="mdi-floppy" /></span>
				Save
			</StandardButton>
		</div>
	{/snippet}
</PageTitle>

<div class="mt-4">
	<DashboardEditor bind:someRowSlotEmpty bind:widgets />
</div>

<style>
	@media screen and (max-width: 600px) {
		.mobile-wrap {
			flex-wrap: wrap;
		}
	}
</style>
