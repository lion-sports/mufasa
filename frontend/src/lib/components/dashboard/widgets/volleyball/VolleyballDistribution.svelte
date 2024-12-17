<script lang="ts">
	import ConfirmOrCancelButtons from "@/lib/components/common/ConfirmOrCancelButtons.svelte"
	import StandardDialog from "@/lib/components/common/StandardDialog.svelte"
	import StandardSelect from "@/lib/components/common/StandardSelect.svelte"
	import ValueChangeIndicator from "@/lib/components/common/ValueChangeIndicator.svelte"
	import PlayerMarker from "@/lib/components/scouts/PlayerMarker.svelte"
	import type { Widget } from "@/lib/services/dashboards/dashboard.service"
	import type { TotalSpikeForPlayerAndPosition, TotalSpikeForPlayerResult, TotalSpikeForPositionResult } from "@/lib/services/scouts/scoutAnalysis.service"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
	import type { TeamFilter } from "@/lib/services/widgets/widgetSettings.service"
	import WidgetSettingsService from "@/lib/services/widgets/widgetSettings.service"
	import { HorizontalStackedProgress, Icon, Skeleton } from "@likable-hair/svelte"
	import type { VolleyballScoutEventPosition } from "lionn-common"
	import { createEventDispatcher } from "svelte"

  let dispatch = createEventDispatcher<{
    'reload': undefined
  }>()

  export let selectedSet: number[] = [],
    widget: Widget<{
      totalSpikeForPosition: TotalSpikeForPositionResult
      totalSpikeForPlayer: TotalSpikeForPlayerResult
      totalSpikeForPlayerAndPosition: TotalSpikeForPlayerAndPosition
      previousTotalSpikeForPosition: TotalSpikeForPositionResult
      previousTotalSpikeForPlayer: TotalSpikeForPlayerResult
      previousTotalSpikeForPlayerAndPosition: TotalSpikeForPlayerAndPosition
    }>,
    loadingData: boolean = false

  let settingsOpened: boolean = false
  
  function getPositionStats(params: {
    position: number,
    teamFilter?: TeamFilter
  }): NonNullable<typeof widget.data>['totalSpikeForPosition'][number] | undefined {
    return widget.data?.totalSpikeForPosition.find((e) => Number(e.position) === Number(params.position) && (!params.teamFilter || (params.teamFilter == 'friend' && !e.opponent) || (params.teamFilter == 'opponent' && e.opponent)))
  }

  let selectedPosition: VolleyballScoutEventPosition | undefined = undefined
  function handlePositionClick(params: {
    position: number
  }) {
    let position = params.position as VolleyballScoutEventPosition
    selectedPosition = position
  }

  $: totalSpike = widget.data?.totalSpikeForPlayer.reduce((p, c, i, a) => {
    return p + c.total
  }, 0) || 0
  $: selectedPositionStats = !!selectedPosition ? widget.data?.totalSpikeForPlayerAndPosition.filter((el) => el.position === selectedPosition) : undefined
  $: selectedPositionPoints = !!selectedPositionStats ? selectedPositionStats.reduce((p, c, i, a) => {
    return p + c.points
  }, 0) : undefined
  $: selectedPositionErrors = !!selectedPositionStats ? selectedPositionStats.reduce((p, c, i, a) => {
    return p + c.errors
  }, 0) : undefined


  let selectedTeamFilter: TeamFilter | undefined = undefined
  $: selectedTeamFilter = widget.widgetSetting?.settings?.widget == 'VolleyballDistribution' ? widget.widgetSetting?.settings.team : undefined
  
  let loadingSaveSetting: boolean = false

  async function handleSaveSettings() {
    loadingSaveSetting = true
    let widgetSettingService = new WidgetSettingsService({ fetch })
    await widgetSettingService.set({
      widgetId: widget.id,
      settings: {
        widget: 'VolleyballDistribution',
        team: selectedTeamFilter
      }
    })
    
    if(!widget.widgetSetting) {
      widget.widgetSetting = {
        id: Math.random(),
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          widget: 'VolleyballDistribution',
          team: selectedTeamFilter
        },
        widgetId: widget.id
      }
    } else if(!!widget.widgetSetting && !widget.widgetSetting?.settings) {
      widget.widgetSetting.settings = {
        widget: 'VolleyballDistribution',
        team: selectedTeamFilter
      }
    } else if(!!widget.widgetSetting && !!widget.widgetSetting?.settings) {
      widget.widgetSetting.settings.team = selectedTeamFilter
    }

    loadingSaveSetting = false
    dispatch('reload')
    settingsOpened = false
  }
</script>

<div
	class="@container w-full h-full rounded-md max-h-full"
>
  <div class="flex justify-between h-[24px]">
    <div></div>
    <div>
      <button on:click={() => settingsOpened = true}>
        <Icon name="mdi-cog"></Icon>
      </button>
    </div>
  </div>
  <div class="h-[calc(100%-24px)] w-full grid grid-cols-1 @md:grid-cols-12 gap-3">
    <div class="@md:col-span-6 @2xl:col-span-4 p-2">
      {#if loadingData}
        <Skeleton
          --skeleton-card-height="100%"
          --skeleton-card-width="100%"
        ></Skeleton>
      {:else}
        <div class="border border-[rgb(var(--global-color-contrast-300),.3)] h-full min-h-[300px] max-h-[400px]">
          <div class="h-1/2 grid grid-cols-3 border-b border-[rgb(var(--global-color-contrast-300),.3)]">
            {#each [4, 3, 2] as position}
              {@const friendsStat = getPositionStats({ position, teamFilter: 'friend' })}
              {@const opponentsStat = getPositionStats({ position, teamFilter: 'opponent' })}
              {@const stats = getPositionStats({ position })}
              <button 
                class="flex flex-col justify-center items-center relative transition-all"
                class:not-selected={selectedPosition !== undefined && selectedPosition !== position}
                on:click={() => handlePositionClick({ position })}
              >
                {#if !widget.widgetSetting?.settings?.team || widget.widgetSetting?.settings?.team == "both"}
                  <div 
                    class="absolute"
                    style:bottom="0px"
                    style:height={friendsStat?.friendsPercentage?.toFixed(2) + '%'}
                    style:left="0px"
                    style:right="50%"
                    style:background-color="rgb(59, 130, 246, .3)"
                    style:z-index="-5"
                  ></div>
                  <div 
                    class="absolute"
                    style:bottom="0px"
                    style:height={opponentsStat?.opponentsPercentage?.toFixed(2) + '%'}
                    style:left="50%"
                    style:right="0px"
                    style:background-color="rgb(239, 68, 68, .3)"
                    style:z-index="-5"
                  ></div>
                  <div class="font-light text-xs"># {friendsStat?.total || 0} vs # {opponentsStat?.total || 0}</div>
                {:else}
                  <div 
                    class="absolute"
                    style:bottom="0px"
                    style:height={stats?.percentage.toFixed(2) + '%'}
                    style:left="0px"
                    style:right="0px"
                    style:background-color={widget.widgetSetting?.settings?.team == "friend" ? "rgb(59, 130, 246, .3)" : "rgb(239, 68, 68, .3)"}
                    style:z-index="-5"
                  ></div>
                  <div 
                    class:font-bold={!!stats}
                  >{stats?.percentage.toFixed(2) || 0} %</div>
                  <div class="font-light text-xs"># {stats?.total || 0}</div>
                {/if}
              </button>
            {/each}
          </div>
          <div class="h-1/2 grid grid-cols-3">
            {#each [5, 6, 1] as position}
              {@const friendsStat = getPositionStats({ position, teamFilter: 'friend' })}
              {@const opponentsStat = getPositionStats({ position, teamFilter: 'opponent' })}
              {@const stats = getPositionStats({ position })}
              <button 
                class="flex flex-col justify-center items-center relative transition-all"
                class:not-selected={selectedPosition !== undefined && selectedPosition !== position}
                on:click={() => handlePositionClick({ position })}
              >
                {#if !widget.widgetSetting?.settings?.team || widget.widgetSetting?.settings?.team == "both"}
                  <div 
                    class="absolute"
                    style:bottom="0px"
                    style:height={friendsStat?.friendsPercentage?.toFixed(2) + '%'}
                    style:left="0px"
                    style:right="50%"
                    style:background-color="rgb(59, 130, 246, .3)"
                    style:z-index="-5"
                  ></div>
                  <div 
                    class="absolute"
                    style:bottom="0px"
                    style:height={opponentsStat?.opponentsPercentage?.toFixed(2) + '%'}
                    style:left="50%"
                    style:right="0px"
                    style:background-color="rgb(239, 68, 68, .3)"
                    style:z-index="-5"
                  ></div>
                  <div class="font-light text-xs"># {friendsStat?.total || 0} vs # {opponentsStat?.total || 0}</div>
                {:else}
                  <div 
                    class="absolute"
                    style:bottom="0px"
                    style:height={stats?.percentage.toFixed(2) + '%'}
                    style:left="0px"
                    style:right="0px"
                    style:background-color={widget.widgetSetting?.settings?.team == "friend" ? "rgb(59, 130, 246, .3)" : "rgb(239, 68, 68, .3)"}
                    style:z-index="-5"
                  ></div>
                  <div 
                    class:font-bold={!!stats}
                  >{stats?.percentage.toFixed(2) || 0} %</div>
                  <div class="font-light text-xs"># {stats?.total || 0}</div>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    <div class="@md:col-span-6 @2xl:col-span-8 p-2 @md:h-[350px]">
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
        {#if selectedPosition !== undefined}
          <div class="flex flex-col h-full w-full overflow-auto">
            <div>
              <button on:click={() => { selectedPosition = undefined }} style:cursor="pointer" class="flex">
                <div class="back-icon">
                  <Icon name="mdi-arrow-left" />
                </div>
                <span style:margin-left="10px"> Indietro </span>
              </button>
            </div>
            <div class="text-2xl font-bold mb-2">Zona {selectedPosition}</div>
            <div class="mt-2">
              <HorizontalStackedProgress
                progresses={[
                  {
                    label: 'Punti',
                    value: selectedPositionPoints || 0,
                    color: 'rgb(34 197 94)'
                  },
                  {
                    label: 'Errori',
                    value: selectedPositionErrors || 0,
                    color: 'rgb(var(--global-color-error-500))'
                  },
                ]}
              />
            </div>
            {#if !!selectedPositionStats}
              <div class="w-full overflow-auto relative mt-4">
                <table>
                  <thead class="sticky top-0 bg-[rgb(var(--global-color-background-100))]">
                    <tr>
                      <th></th>
                      <th class="text-left pl-3">#</th>
                      <th class="text-left pl-3">%</th>
                      <th class="text-left pl-3">Punti</th>
                      <th class="text-left pl-3">Errori</th>
                      <th class="text-left pl-3">
                        <div>% Punti</div>
                        <div class="font-light text-xs">su totale zona</div>
                      </th>
                      <th class="text-left pl-3">
                        <div>% Errori</div>
                        <div class="font-light text-xs">su totale zona</div>
                      </th>
                    </tr>
                  </thead>
                  {#each selectedPositionStats as positionStat}
                    <tr class="hover:bg-[rgb(var(--global-color-background-200))] transition-all">
                      <td class="py-2 pr-2 flex items-center gap-2 sticky left-0 bg-[rgb(var(--global-color-background-100))] z-10">
                        <div>
                          <PlayerMarker 
                            friend={!positionStat.player.isOpponent}
                            opponent={positionStat.player.isOpponent}
                            libero={positionStat.player.role == 'libero'}
                          >{positionStat.player.shirtNumber}</PlayerMarker>
                        </div>
                        <div class="font-semibold text-lg mb-2">
                          {TeammatesService.getTeammateName({
                            player: positionStat.player,
                            teammate: positionStat.player.teammate
                          })}
                        </div>
                      </td>
                      <td class="pl-3">{positionStat.total}</td>
                      <td class="pl-3">{positionStat.percentage.toFixed(2)} %</td>
                      <td class="pl-3">{positionStat.points}</td>
                      <td class="pl-3">{positionStat.errors}</td>
                      <td class="pl-3">{positionStat.pointsPercentage} %</td>
                      <td class="pl-3">{positionStat.errorsPercentage} %</td>
                    </tr>
                  {/each}
                </table>
              </div>
            {/if}
          </div>
        {:else}
          {#if !!widget.data?.totalSpikeForPlayer && widget.data.totalSpikeForPlayer.length > 0}
            <div class="flex flex-col gap-2 h-full overflow-auto">
              {#each widget.data?.totalSpikeForPlayer as playerStats}
                {@const previousStat = widget.data.previousTotalSpikeForPlayer.find((e) => e.player.id == playerStats.player.id)}
                {@const previousStatPercentageDifference = Number((playerStats.percentage - (previousStat?.percentage || 0)).toFixed(0))}
                {@const previousStatPointsDifference = Number((playerStats.points - (previousStat?.points || 0)).toFixed(0))}
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
                            label: 'Difesi',
                            value: playerStats.total - playerStats.points - playerStats.errors,
                            color: 'grey'
                          },
                          {
                            label: 'Restanti',
                            value:  totalSpike - playerStats.points - playerStats.errors,
                            color: 'rgb(var(--global-color-background-200))'
                          },
                        ]}
                        legendVisible={false}
                        labelVisible={false}
                      />
                    </div>
                    <div class="mb-1 flex gap-2">
                      {playerStats.percentage.toFixed(2)} %
                      {#if previousStat !== undefined}
                        <ValueChangeIndicator
                          difference={previousStatPercentageDifference}
                          postfix="%"
                        ></ValueChangeIndicator>
                      {/if}
                    </div>
                    <div class="font-light mb-1">
                      # {playerStats.total}
                    </div>
                    <div class="mb-1 flex gap-2">
                      Punti: {playerStats.points}
                      {#if previousStat !== undefined}
                        <ValueChangeIndicator
                          difference={previousStatPointsDifference}
                        ></ValueChangeIndicator>
                      {/if}
                    </div>
                    <div class="mb-1">
                      Errori: {playerStats.errors}
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
      {/if}
    </div>
  </div>
</div>

<!-- 'friend' | 'opponent' | 'both' -->
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

<style>
  .not-selected {
    opacity: 30%;
  }
</style>