<script lang="ts">
	import ConfirmOrCancelButtons from "@/lib/components/common/ConfirmOrCancelButtons.svelte"
	import StandardDialog from "@/lib/components/common/StandardDialog.svelte"
	import StandardSelect from "@/lib/components/common/StandardSelect.svelte"
	import ValueChangeIndicator from "@/lib/components/common/ValueChangeIndicator.svelte"
	import PlayerMarker from "@/lib/components/scouts/PlayerMarker.svelte"
	import type { Widget } from "@/lib/services/dashboards/dashboard.service"
	import type { TotalReceiveByPlayerResult, TotalReceiveResult } from "@/lib/services/scouts/scoutAnalysis.service"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
	import type { TeamFilter } from "@/lib/services/widgets/widgetSettings.service"
	import WidgetSettingsService from "@/lib/services/widgets/widgetSettings.service"
	import { GanymedeBarChart, HorizontalStackedProgress, Icon, Skeleton, theme } from "@likable-hair/svelte"
	import { createEventDispatcher, type ComponentProps } from "svelte"

  let dispatch = createEventDispatcher<{
    'reload': undefined
  }>()

  export let selectedSet: number[] = [],
    widget: Widget<{
      totalReceive: TotalReceiveResult
      totalReceiveByPlayer: TotalReceiveByPlayerResult
      previousTotalReceiveByPlayer: TotalReceiveByPlayerResult
    }>,
    loadingData: boolean = false

  let data: ComponentProps<GanymedeBarChart>['data'] = {
    labels: [],
    datasets: []
  }

  $: setting = widget.widgetSetting?.settings?.widget == 'VolleyballServeSummary' ? widget.widgetSetting?.settings : undefined

  $: if(!!widget.data?.totalReceive) {
    data = {
      labels: ['++', '+', '-', '/', 'x'],
      datasets: []
    }

    if(!setting || setting?.team == 'both' || setting?.team == 'friend') {
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

    if(!setting || setting?.team == 'both' || setting?.team == 'opponent') {
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

    for(let i = 0; i < widget.data.totalReceive.length; i += 1) {
      let totalReceiveRow = widget.data.totalReceive[i]

      let datasetIndex = -1
      if(totalReceiveRow.opponent) {
        datasetIndex = data.datasets.findIndex((d) => d.label == 'Avversari')
      } else {
        datasetIndex = data.datasets.findIndex((d) => d.label == 'Amici')
      }

      if(datasetIndex === -1) continue
      data.datasets[datasetIndex].data = [ 
        totalReceiveRow.perfect, 
        totalReceiveRow.plus, 
        totalReceiveRow.minus,
        totalReceiveRow.slash,
        totalReceiveRow.error
      ]
    }
  }

  let settingsOpened: boolean = false
  let selectedTeamFilter: TeamFilter | undefined = undefined
  $: selectedTeamFilter = widget.widgetSetting?.settings?.widget == 'VolleyballReceiveSummary' ? widget.widgetSetting?.settings.team : undefined
  
  let loadingSaveSetting: boolean = false

  async function handleSaveSettings() {
    loadingSaveSetting = true
    let widgetSettingService = new WidgetSettingsService({ fetch })
    await widgetSettingService.set({
      widgetId: widget.id,
      settings: {
        widget: 'VolleyballReceiveSummary',
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
    <div class="text-lg font-bold">
      Receive summary
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
        <GanymedeBarChart
          data={data}
          rgbTooltipBackgroundColor={$theme.colors?.[$theme.active]['dark']['background']['200']}
          rgbTooltipColor={$theme.colors?.[$theme.active]['dark']['contrast']['200']}
          showLegend={false}
          showXTicks={true}
          showYTicks={true}
          lineWidth={0}
          maintainAspectRatio={false}
          xTickLabel={(value) => {
            return ['++', '+', '-', '/', 'x'][Number(value)]
          }}
        ></GanymedeBarChart>
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
        {#if !!widget.data?.totalReceiveByPlayer && widget.data.totalReceiveByPlayer.length > 0}
          <div class="flex flex-col gap-2 h-full overflow-auto">
            {#each widget.data.totalReceiveByPlayer as playerStats}
              {@const previousStat = widget.data.previousTotalReceiveByPlayer.find((e) => e.player.id == playerStats.player.id)}
              {@const previousStatPerfectPercentageDifference = Number((playerStats.perfectPercentage - (previousStat?.perfectPercentage || 0)).toFixed(0))}
              {@const previousStatPlusPercentageDifference = Number((playerStats.plusPercentage - (previousStat?.plusPercentage || 0)).toFixed(0))}
              {@const previousStatMinusPercentageDifference = Number((playerStats.minusPercentage - (previousStat?.minusPercentage || 0)).toFixed(0))}
              {@const previousStatSlashPercentageDifference = Number((playerStats.slashPercentage - (previousStat?.slashPercentage || 0)).toFixed(0))}
              {@const previousStatErrorPercentageDifference = Number((playerStats.errorPercentage - (previousStat?.errorPercentage || 0)).toFixed(0))}
              {@const previousStatPerfectDifference = Number((playerStats.perfect - (previousStat?.perfect || 0)).toFixed(0))}
              {@const previousStatPlusDifference = Number((playerStats.plus - (previousStat?.plus || 0)).toFixed(0))}
              {@const previousStatMinusDifference = Number((playerStats.minus - (previousStat?.minus || 0)).toFixed(0))}
              {@const previousStatSlashDifference = Number((playerStats.slash - (previousStat?.slash || 0)).toFixed(0))}
              {@const previousStatErrorDifference = Number((playerStats.error - (previousStat?.error || 0)).toFixed(0))}
              <div class="flex gap-2">
                <div>
                  <PlayerMarker 
                    friend={!playerStats.player.isOpponent}
                    opponent={playerStats.player.isOpponent}
                    libero={playerStats.player.role == 'libero'}
                  >{playerStats.player.shirtNumber}</PlayerMarker>
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
                          label: '++',
                          value: playerStats.perfect,
                          color: 'rgb(34 197 94)'
                        },
                        {
                          label: '+',
                          value: playerStats.plus,
                          color: 'rgb(34 197 94)'
                        },
                        {
                          label: '-',
                          value: playerStats.minus,
                          color: 'grey'
                        },
                        {
                          label: '/',
                          value: playerStats.slash,
                          color: 'rgb(var(--global-color-error-500))'
                        },
                        {
                          label: 'x',
                          value: playerStats.error,
                          color: 'rgb(var(--global-color-error-500))'
                        }
                      ]}
                      legendVisible={false}
                      labelVisible={false}
                    />
                  </div>
                  <div class="grid grid-cols-1">
                    <div class="grid grid-cols-5 gap-1">
                      <div class="mb-1 flex gap-2">
                        ++: {playerStats.perfect}
                        {#if previousStat !== undefined}
                          <ValueChangeIndicator
                            difference={previousStatPerfectDifference}
                          ></ValueChangeIndicator>
                        {/if}
                      </div>
                      <div class="mb-1 flex gap-2">
                        +: {playerStats.plus}
                        {#if previousStat !== undefined}
                          <ValueChangeIndicator
                            difference={previousStatPlusDifference}
                          ></ValueChangeIndicator>
                        {/if}
                      </div>
                      <div class="mb-1 flex gap-2">
                        -: {playerStats.minus}
                        {#if previousStat !== undefined}
                          <ValueChangeIndicator
                            difference={previousStatMinusDifference}
                            invertPositivity
                          ></ValueChangeIndicator>
                        {/if}
                      </div>
                      <div class="mb-1 flex gap-2">
                        /: {playerStats.slash}
                        {#if previousStat !== undefined}
                          <ValueChangeIndicator
                            difference={previousStatSlashDifference}
                            invertPositivity
                          ></ValueChangeIndicator>
                        {/if}
                      </div>
                      <div class="mb-1 flex gap-2">
                        x: {playerStats.slash}
                        {#if previousStat !== undefined}
                          <ValueChangeIndicator
                            difference={previousStatSlashDifference}
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