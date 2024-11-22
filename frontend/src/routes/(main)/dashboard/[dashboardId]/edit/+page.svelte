<script lang="ts">
	import type { PageData } from './$types'
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import DashboardService from '$lib/services/dashboards/dashboard.service'
	import DashboardEditor from '$lib/components/dashboard/DashboardEditor.svelte'
	import { Icon } from '@likable-hair/svelte'

	export let data: PageData

	let someRowSlotEmpty: boolean = false,
		loadingSave: boolean = false

	$: valid = !someRowSlotEmpty && data.dashboard.widgets?.length > 0 && !!data.dashboard.name

	async function saveDashboard() {
		loadingSave = true

		let service = new DashboardService({ fetch })
		await service.update({
			id: data.dashboard.id,
			name: data.dashboard.name,
			active: true,
			widgets: data.dashboard.widgets
		})

		loadingSave = false
		window.history.back()
	}
</script>

<PageTitle title={data.dashboard.name} prependVisible>
	<svelte:fragment slot="title">
		<div class="flex justify-between items-center mobile-wrap gap-2">
			<input
				type="text"
				class="border-none bg-transparent outline-none
				focus:bg-[rgb(var(--global-color-primary-500),.2)] rounded-md px-3
				w-full
				"
				bind:value={data.dashboard.name}
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
	</svelte:fragment>
</PageTitle>

<div class="mt-4">
	<DashboardEditor bind:someRowSlotEmpty bind:widgets={data.dashboard.widgets} />
</div>

<style>
	@media screen and (max-width: 600px) {
		.mobile-wrap {
			flex-wrap: wrap;
		}
	}
</style>
