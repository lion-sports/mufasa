<script lang="ts">
  import { run } from 'svelte/legacy';

	import type { ScoutAnalysis } from "@/lib/services/scouts/scouts.service"
	import ScoutsService from "@/lib/services/scouts/scouts.service"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
	import { LineChart } from "@likable-hair/svelte"
	import type { ComponentProps } from "svelte"
  import lodash from 'lodash'
	import StandardButton from "@/lib/components/common/StandardButton.svelte"

  interface Props {
    analysis: ScoutAnalysis;
  }

  let { analysis }: Props = $props();

  let chartData: ComponentProps<typeof LineChart>['data'] = $state({
      labels: [],
      datasets: []
    }),
    resetZoom: boolean = $state(false)

  let orderedReceiveOverTimeByPlayer = $derived(analysis.receiveOverTimeByPlayer)
  let allPlayers = $derived(lodash.uniqBy(orderedReceiveOverTimeByPlayer.map((e) => e.player), (e) => e.id))

  run(() => {
    if(!!orderedReceiveOverTimeByPlayer) {
      chartData = {
        labels: [],
        datasets: allPlayers.map((player, i) => ({
          data: [],
          label: TeammatesService.getTeammateName({
            teammate: player.teammate,
            player: player
          }) || 'Maglia ' + player.shirtNumber,
          backgroundColor: player.isOpponent ? 
            ScoutsService.opponentsColors[i % ScoutsService.opponentsColors.length] : 
            ScoutsService.friendsColors[i % ScoutsService.friendsColors.length],
          borderColor: 
            player.isOpponent ? 
            ScoutsService.opponentsColors[i % ScoutsService.opponentsColors.length] : 
            ScoutsService.friendsColors[i % ScoutsService.friendsColors.length],
          spanGaps: true,
          tension: .3
        }))
      }

      for(let i = 0; i < orderedReceiveOverTimeByPlayer.length; i += 1) {
        let row = orderedReceiveOverTimeByPlayer[i]
        let datasetLabel = TeammatesService.getTeammateName({
          teammate: row.player.teammate,
          player: row.player
        }) || 'Maglia ' + row.player.shirtNumber

        chartData.labels = [
          ...chartData.labels,
          row.points.friends.points + ' - ' + row.points.enemy.points
        ]

        let datasetIndex = chartData.datasets.findIndex((d) => d.label == datasetLabel)
        if(datasetIndex === -1) { continue }

        for(let k = 0; k < chartData.datasets.length; k += 1) {
          if(k === datasetIndex) chartData.datasets[k].data = [
            ...chartData.datasets[k].data,
            row.resultValue
          ]
          else chartData.datasets[k].data = [
            ...chartData.datasets[k].data,
            null
          ]
        }
      }
    }
  });
</script>

<div class="flex w-full justify-center mb-3">
  <StandardButton
    on:click={() => {
      resetZoom = true
    }}
  >Reset zoom</StandardButton>
</div>
<LineChart
  data={chartData}
  enableZoom={true}
  bind:resetZoom
  showYTicks
  showXTicks
  xTickStepSize={1}
></LineChart>