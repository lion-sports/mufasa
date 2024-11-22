<script lang="ts">
	import StandardButton from "@/lib/components/common/StandardButton.svelte"
	import StandardDialog from "@/lib/components/common/StandardDialog.svelte"
	import DashboardEditor from "@/lib/components/dashboard/DashboardEditor.svelte"
	import type { Dashboard } from "@/lib/services/dashboards/dashboard.service"
	import DashboardService from "@/lib/services/dashboards/dashboard.service"
	import { Icon } from "@likable-hair/svelte"

  export let dashboards: Dashboard[] = []

  let loadingActiveDashboard: boolean = false
	async function activeDashboard(dashboard: Dashboard) {
		loadingActiveDashboard = true

		let service = new DashboardService({ fetch })
		await service.active({
			dashboard
		})

    await fetchDashboards()

		loadingActiveDashboard = false
	}

	let confirmDeleteDashboardDialog: boolean = false,
		deletingDashboard: Dashboard | undefined = undefined,
		loadingDeleteDashboard: boolean = false
	async function handleConfirmDashboardDelete() {
		if (!deletingDashboard) return

		loadingDeleteDashboard = true

		let service = new DashboardService({ fetch })
		await service.destroy({ id: deletingDashboard.id })

		await fetchDashboards()
		loadingDeleteDashboard = false
		confirmDeleteDashboardDialog = false
	}

  async function fetchDashboards() {
    let service = new DashboardService({ fetch })
    let dashboardsListResults = await service.list({
      page: 1,
      perPage: 100
    })
    dashboards = dashboardsListResults.data
  }
</script>

{#if dashboards.length === 0}
  <div class="w-full h-[70vh] flex justify-center items-center font-light text-sm">
    No dashboard available,
    <a href="/dashboard/new" class="ml-2 text-[rgb(var(--global-color-primary-500))]"
      >create one</a
    >
  </div>
{:else}
  {#each dashboards as dashboard}
    <div class="flex flex-col gap-1">
      <a
        class="h-[140px] w-[180px] bg-[rgb(var(--global-color-background-300))] rounded-md shadow-md active:shadow-none hover:shadow-none transition-shadow duration-200"
        href="/dashboard/{dashboard.id}/edit"
      >
        <div
          class="p-2 h-full rounded-md border-[rgb(var(--global-color-primary-500))]"
          class:border-4={dashboard.active}
        >
          <DashboardEditor
            widgets={dashboard.widgets}
            preview
            --dashboard-shaper-widget-height="calc(140px/8)"
            --dashboard-shaper-widget-preview-border-radius="2px"
            --dashboard-shaper-gap="4px"
          />
        </div>
      </a>
      <div class="mt-1 text-xl font-bold max-w-[180px]">{dashboard.name}</div>
      <div class="flex flex-col items-start">
        {#if !dashboard.active}
          <button
            class="text-[rgb(var(--global-color-primary-500))]"
            on:click={() => activeDashboard(dashboard)}
            disabled={loadingActiveDashboard}
          >
            {#if loadingActiveDashboard}
              ...
            {:else}
              <Icon name="mdi-checkbox-marked-circle-outline" />
              Use this dashboard
            {/if}
          </button>
          {#if !dashboard.default || dashboard.default == undefined}
            <button
              class="text-[rgb(var(--global-color-error-500))]"
              class:opacity-50={dashboard.active || loadingDeleteDashboard}
              disabled={dashboard.active || loadingDeleteDashboard}
              on:click={() => {
                deletingDashboard = dashboard
                confirmDeleteDashboardDialog = true
              }}
            >
              <Icon name="mdi-delete" />
              Delete
            </button>
          {/if}
        {/if}
      </div>
    </div>
  {/each}
{/if}

<StandardDialog bind:open={confirmDeleteDashboardDialog}>
	<div class="px-4 pt-6 pb-4 flex flex-col items-center gap-2">
		<Icon class="mb-2" name="mdi-help-circle" --icon-size="50px" />
		<div class="font-bold text-2xl">Are you sure?</div>
		<div class="max-w-md text-base mb-2">
			Do you really want to delete dashboard <strong>{deletingDashboard?.name}</strong> ?
		</div>
		<div class="w-full flex gap-2">
			<StandardButton
				--button-width="100%"
				style="secondary"
				on:click={() => (confirmDeleteDashboardDialog = false)}>Cancel</StandardButton
			>
			<StandardButton
				--button-width="100%"
				style="primary"
				loading={loadingDeleteDashboard}
				on:click={handleConfirmDashboardDelete}>Confirm</StandardButton
			>
		</div>
	</div>
</StandardDialog>
