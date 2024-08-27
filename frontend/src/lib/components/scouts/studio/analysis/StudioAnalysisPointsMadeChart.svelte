<script lang="ts">
	import type { ScoutAnalysis } from "$lib/services/scouts/scouts.service";
	import { GanymedeBarChart, theme } from "@likable-hair/svelte"
	import type { ComponentProps } from "svelte"
  import TeammatesService from "@/lib/services/teammates/teammates.service";
	import ScoutsService from "$lib/services/scouts/scouts.service"
  import lodash from 'lodash'

  export let pointsMade: ScoutAnalysis['pointsMade'],
    opponent: boolean | undefined = undefined,
    maxPoints: number | undefined = undefined,
    groupBy: 'none' | 'category' = 'none'

  let pointsMadeData: ComponentProps<GanymedeBarChart>['data'] = undefined,
    dataGroupedByPlayer: Record<number, {
      player: typeof pointsMade[number]['player'],
      pointsMade: typeof pointsMade[number]['pointsMade'],
    }> = {}

  $: if(!!pointsMade) {
    dataGroupedByPlayer = {}
    for(let i = 0; i < pointsMade.length; i += 1) {
      let row = pointsMade[i]

      if(opponent === undefined || row.player.isOpponent === opponent) {
        if(!dataGroupedByPlayer[row.player.id]) dataGroupedByPlayer[row.player.id] = lodash.cloneDeep(row)
        else {
          dataGroupedByPlayer[row.player.id].pointsMade = dataGroupedByPlayer[row.player.id].pointsMade + row.pointsMade
        }
      }

    }
  }

  $: if(!!dataGroupedByPlayer && groupBy == 'none') {
    pointsMadeData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Punti fatti',
          backgroundColor: opponent ? ScoutsService.opponentsColors[0] : ScoutsService.friendsColors[0],
          borderColor: opponent ? ScoutsService.opponentsColors[1] : ScoutsService.friendsColors[1]
        }
      ]
    }

    for(const [playerId, row] of Object.entries(dataGroupedByPlayer)) {
      pointsMadeData.labels.push(
        TeammatesService.getTeammateName({
          teammate: row.player.teammate,
          player: row.player
        }) || ('Maglia ' + row.player.shirtNumber))

      pointsMadeData.datasets[0].data.push(row.pointsMade)
    }

    pointsMadeData = {
      ...pointsMadeData
    }
  } else if(!!dataGroupedByPlayer && !!pointsMade && groupBy == 'category') {
    pointsMadeData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Attacchi',
          backgroundColor: opponent ? ScoutsService.opponentsColors[0] : ScoutsService.friendsColors[0],
          borderColor: opponent ? ScoutsService.opponentsColors[0] : ScoutsService.friendsColors[0]
        },
        {
          data: [],
          label: 'Muri',
          backgroundColor: opponent ? ScoutsService.opponentsColors[1] : ScoutsService.friendsColors[1],
          borderColor: opponent ? ScoutsService.opponentsColors[1] : ScoutsService.friendsColors[1]
        },
        {
          data: [],
          label: 'Servizi',
          backgroundColor: opponent ? ScoutsService.opponentsColors[2] : ScoutsService.friendsColors[2],
          borderColor: opponent ? ScoutsService.opponentsColors[2] : ScoutsService.friendsColors[2]
        }
      ]
    }

    for(const [playerId, row] of Object.entries(dataGroupedByPlayer)) {
      let spikePoints = pointsMade.find((pm) => pm.category == 'spike' && pm.player.id == Number(playerId))?.pointsMade || 0
      let blockPoints = pointsMade.find((pm) => pm.category == 'block' && pm.player.id == Number(playerId))?.pointsMade || 0
      let servePoints = pointsMade.find((pm) => pm.category == 'serve' && pm.player.id == Number(playerId))?.pointsMade || 0

      pointsMadeData.labels.push(
        TeammatesService.getTeammateName({
          teammate: row.player.teammate,
          player: row.player
        }) || ('Maglia ' + row.player.shirtNumber))

      pointsMadeData.datasets[0].data.push(spikePoints)
      pointsMadeData.datasets[1].data.push(blockPoints)
      pointsMadeData.datasets[2].data.push(servePoints)
    }
  }
</script>

<GanymedeBarChart
  data={pointsMadeData}
  rgbBackgroundColor={$theme.dark ? "255, 255, 255" : "100, 100, 100"}
  showYTicks
  showXTicks
  rgbTooltipBackgroundColor={opponent ? ScoutsService.opponentsRgbColors[0] : ScoutsService.friendsRgbColors[0]}
  rgbTooltipColor="255, 255, 255"
  xTickLabel={(tickValue, index, ticks) => {
    return pointsMadeData?.labels[index] || tickValue
  }}
  yTickLabel={(tickValue) => {
    return Number(tickValue) % 1 === 0 ? tickValue : ''
  }}
  yTickStepSize={1}
  yMax={maxPoints}
></GanymedeBarChart>