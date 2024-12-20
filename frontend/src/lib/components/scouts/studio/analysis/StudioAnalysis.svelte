<script lang="ts">
	import type { ScoutAnalysis, ScoutStudio } from "$lib/services/scouts/scouts.service"
	import type { Dashboard } from "@/lib/services/dashboards/dashboard.service"
	import DashboardEditor from "@/lib/components/dashboard/DashboardEditor.svelte"
	import { Icon, ToggleList } from "@likable-hair/svelte"
  import studio from "@/lib/stores/scout/studio";

  export let analysis: ScoutAnalysis | undefined,
    dashboard: Dashboard | undefined = undefined

  $: totalSets = Math.min(($studio?.scout.stash?.points?.enemy.sets || 0) + ($studio?.scout.stash?.points?.friends.sets || 0) + 1, 5)

  let selectedSets: {
    value: number
  }[] | undefined = undefined

  $: if(selectedSets === undefined) {
    selectedSets = [
      ...Array.from(Array(
        Math.min(($studio?.scout.stash?.points?.enemy.sets || 0) + ($studio?.scout.stash?.points?.friends.sets || 0) + 1, 5)
      ).keys()).map((i) => {
        return {
          value: i + 1,
          label: 'Set ' + (i + 1)
        }
      })
    ]
  }

  function handleSetChange(ev: CustomEvent<{ selection: NonNullable<typeof selectedSets>}>) {
    selectedSets = ev.detail.selection
  }
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
      <div class="py-1">
        <ToggleList
          items={Array.from(Array(totalSets).keys()).map((i) => {
            return {
              value: i + 1,
              label: 'Set ' + (i + 1)
            }
          })}
          values={selectedSets}
          on:change={handleSetChange}
        ></ToggleList>
      </div>
      <div class="flex justify-center items-center">
        {#if !!$studio}
          <DashboardEditor
            widgets={dashboard?.widgets}
            canDelete={false}
            canAdd={false}
            selectedSet={(selectedSets || []).map((e) => e.value)}
            scoutId={$studio.scout.id}
          />
        {/if}
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