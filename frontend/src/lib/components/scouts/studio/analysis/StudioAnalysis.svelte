<script lang="ts">
	import type { ScoutAnalysis } from "$lib/services/scouts/scouts.service"
	import type { Dashboard } from "@/lib/services/dashboards/dashboard.service"
	import DashboardEditor from "@/lib/components/dashboard/DashboardEditor.svelte"
	import { Icon } from "@likable-hair/svelte"

  export let analysis: ScoutAnalysis | undefined,
    dashboard: Dashboard | undefined = undefined
</script>

{#if analysis}
  {#if !!dashboard}
    <div class="flex flex-col gap-2">
      <div class="flex justify-center items-center gap-2">
        <div class="text-2xl font-bold">{dashboard?.name}</div>
        <div>
          <a href={`/dashboard/${dashboard.id}/edit`}>
            <Icon name="mdi-pencil"></Icon>
          </a>
        </div>
      </div>
      <div class="flex justify-center items-center">
        <DashboardEditor
          widgets={dashboard?.widgets}
          canDelete={false}
          canAdd={false}
        />
      </div>
    </div>
  {:else}
    <div class="w-full h-[70vh] flex justify-center items-center font-light text-sm">
      No dashboard available,
      <a href="/dashboard/new" class="ml-2 text-[rgb(var(--global-color-primary-500))]"
        >create one</a
      >
    </div>
  {/if}
{:else}
  <div class="h-[400px] flex justify-center items-center">
    <div class="font-light">Nessun dato</div>
  </div>
{/if}