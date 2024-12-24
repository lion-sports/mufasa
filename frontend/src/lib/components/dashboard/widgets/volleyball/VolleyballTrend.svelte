<script lang="ts">
	import ConfirmOrCancelButtons from "@/lib/components/common/ConfirmOrCancelButtons.svelte"
	import StandardAutocomplete from "@/lib/components/common/StandardAutocomplete.svelte"
	import StandardDialog from "@/lib/components/common/StandardDialog.svelte"
	import StandardSelect from "@/lib/components/common/StandardSelect.svelte"
	import StandardTextfield from "@/lib/components/common/StandardTextfield.svelte"
	import ValueChangeIndicator from "@/lib/components/common/ValueChangeIndicator.svelte"
	import PlayerMarker from "@/lib/components/scouts/PlayerMarker.svelte"
	import type { Widget } from "@/lib/services/dashboards/dashboard.service"
	import type { TotalServeByPlayerResult, TotalServeResult, TotalSpikeForPlayerAndPositionResult, TotalSpikeForPlayerResult, TotalSpikeForPositionResult, TrendResult } from "@/lib/services/scouts/scoutAnalysis.service"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
	import type { TeamFilter } from "@/lib/services/widgets/widgetSettings.service"
	import WidgetSettingsService from "@/lib/services/widgets/widgetSettings.service"
	import { GanymedeLineChart, HorizontalStackedProgress, Icon, Skeleton, theme } from "@likable-hair/svelte"
	import { createEventDispatcher, type ComponentProps } from "svelte"

  let dispatch = createEventDispatcher<{
    'reload': undefined
  }>()

  export let selectedSet: number[] = [],
    widget: Widget<{
      totalTrend: TrendResult
      trendForType: {
        [Key in 'block' | 'serve' | 'spike' | 'receive']?: TrendResult
      }
    }>,
    loadingData: boolean = false

  let data: ComponentProps<GanymedeLineChart>['data'] = {
    labels: [],
    datasets: []
  }

  $: if(!!widget.data?.totalTrend) {
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
        tension: 0.3
      }
    ]

    for(let i = 0; i < widget.data.totalTrend.length; i += 1) {
      let trendRow = widget.data.totalTrend[i]
      data.labels = [...data.labels, '']
      data.datasets[0].data = [
        ...data.datasets[0].data,
        trendRow.windowAverageRating
      ]
    }
  }

  let settingsOpened: boolean = false
  let selectedTeamFilter: TeamFilter | undefined = undefined
  $: selectedTeamFilter = widget.widgetSetting?.settings?.widget == 'VolleyballTrend' ? widget.widgetSetting?.settings.team : undefined
  let selectedType: ('block' | 'serve' | 'spike' | 'receive')[] | undefined = undefined
  $: selectedType = widget.widgetSetting?.settings?.widget == 'VolleyballTrend' ? widget.widgetSetting?.settings.type : undefined
  let selectedWindow: number | undefined = undefined
  $: selectedWindow = widget.widgetSetting?.settings?.widget == 'VolleyballTrend' ? widget.widgetSetting?.settings.window : undefined
  
  let loadingSaveSetting: boolean = false

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
      <button on:click={() => settingsOpened = true}>
        <Icon name="mdi-cog"></Icon>
      </button>
    </div>
  </div>
  <div class="h-[calc(100%-24px)] w-full grid grid-cols-1 @md:grid-cols-12 gap-3">
    <div class="@md:col-span-6 p-2 min-h-[320px]">
      {#if loadingData}
        <Skeleton
          --skeleton-card-height="100%"
          --skeleton-card-width="100%"
        ></Skeleton>
      {:else}
        <GanymedeLineChart
          data={data}
          showXTicks={true}
          showYTicks={true}
          lineWidth={0}
          maintainAspectRatio={false}
          enableZoom={false}
          yMax={100}
        ></GanymedeLineChart>
      {/if}
    </div>
    <div class="@md:col-span-6 p-2 @md:h-[350px]">
      {#if loadingData}
        <div class="flex flex-col gap-4">
          {#each Array.from(Array(3).keys()) as i}
            <div class="flex flex-col gap-2">
              <Skeleton
                --skeleton-card-height="32px"
                --skeleton-card-width="100%"
              ></Skeleton>
              <Skeleton
                --skeleton-card-height="24px"
                --skeleton-card-width="64%"
              ></Skeleton>
            </div>
          {/each}
        </div>
      {:else}
      {/if}
    </div>
  </div>
</div>

<StandardDialog
  title="Impostazioni"
  bind:open={settingsOpened}
>
  <div class="py-2 min-w-[min(90vw,400px)]">
    <div class="flex flex-col gap-2">
      <div class="grid grid-cols-12 items-center">
        <div class="col-span-4">Visualizza</div>
        <div class="col-span-8">
          <StandardSelect
            options={[
              { value: undefined, text: ''},
              { value: 'friend', text: 'Amici'},
              { value: 'opponent', text: 'Avversari'},
              { value: 'both', text: 'Entrambi'}
            ]}
            value={selectedTeamFilter}
            on:change={(e) => {
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
              { value: 'block', label: 'block'},
              { value: 'serve', label: 'serve'},
              { value: 'spike', label: 'spike'},
              { value: 'receive', label: 'receive'},
            ]}
            values={selectedType?.map((e) => ({ value: e, label: e })) || []}
            on:change={(e) => {
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
            on:input={(e) => {
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
          on:cancel-click={() => settingsOpened = false}
        ></ConfirmOrCancelButtons>
      </div>
    </div>
  </div>
</StandardDialog>