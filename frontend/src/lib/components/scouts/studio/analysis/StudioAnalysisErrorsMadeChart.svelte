<script lang="ts">
  import { run } from 'svelte/legacy';

	import type { ScoutAnalysis } from "$lib/services/scouts/scouts.service";
	import { BarChart, theme } from "@likable-hair/svelte"
	import type { ComponentProps } from "svelte"
  import TeammatesService from "@/lib/services/teammates/teammates.service";
	import ScoutsService from "$lib/services/scouts/scouts.service"
  import lodash from 'lodash'

  interface Props {
    errorsMade: ScoutAnalysis['errorsMade'];
    opponent?: boolean | undefined;
    maxPoints?: number | undefined;
    groupBy?: 'none' | 'category';
  }

  let {
    errorsMade,
    opponent = undefined,
    maxPoints = undefined,
    groupBy = 'none'
  }: Props = $props();

  let errorsMadeData: ComponentProps<typeof BarChart>['data'] = $state(undefined),
    dataGroupedByPlayer: Record<number, {
      player: typeof errorsMade[number]['player'],
      errorsMade: typeof errorsMade[number]['errorsMade'],
    }> = $state({})

  run(() => {
    if(!!errorsMade) {
      dataGroupedByPlayer = {}
      for(let i = 0; i < errorsMade.length; i += 1) {
        let row = errorsMade[i]

        if(opponent === undefined || row.player.isOpponent === opponent) {
          if(!dataGroupedByPlayer[row.player.id]) dataGroupedByPlayer[row.player.id] = lodash.cloneDeep(row)
          else {
            dataGroupedByPlayer[row.player.id].errorsMade = dataGroupedByPlayer[row.player.id].errorsMade + row.errorsMade
          }
        }

      }
    }
  });

  run(() => {
    if(!!dataGroupedByPlayer && groupBy == 'none') {
      errorsMadeData = {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'Errori',
            backgroundColor: opponent ? ScoutsService.opponentsColors[0] : ScoutsService.friendsColors[0],
            borderColor: opponent ? ScoutsService.opponentsColors[1] : ScoutsService.friendsColors[1]
          }
        ]
      }

      for(const [playerId, row] of Object.entries(dataGroupedByPlayer)) {
        errorsMadeData.labels.push(
          TeammatesService.getTeammateName({
            teammate: row.player.teammate,
            player: row.player
          }) || ('Maglia ' + row.player.shirtNumber))

        errorsMadeData.datasets[0].data.push(row.errorsMade)
      }

      errorsMadeData = {
        ...errorsMadeData
      }
    } else if(!!dataGroupedByPlayer && !!errorsMade && groupBy == 'category') {
      errorsMadeData = {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'Attacchi',
            backgroundColor: opponent ? ScoutsService.categoryToColorOpponents['spike'] : ScoutsService.categoryToColorFriends['spike'],
            borderColor: opponent ? ScoutsService.opponentsColors[0] : ScoutsService.friendsColors[0]
          },
          {
            data: [],
            label: 'Muri',
            backgroundColor: opponent ? ScoutsService.categoryToColorOpponents['block'] : ScoutsService.categoryToColorFriends['block'],
            borderColor: opponent ? ScoutsService.opponentsColors[1] : ScoutsService.friendsColors[1]
          },
          {
            data: [],
            label: 'Servizi',
            backgroundColor: opponent ? ScoutsService.categoryToColorOpponents['serve'] : ScoutsService.categoryToColorFriends['serve'],
            borderColor: opponent ? ScoutsService.opponentsColors[2] : ScoutsService.friendsColors[2]
          }
        ]
      }

      for(const [playerId, row] of Object.entries(dataGroupedByPlayer)) {
        let spikePoints = errorsMade.find((pm) => pm.category == 'spike' && pm.player.id == Number(playerId))?.errorsMade || 0
        let blockPoints = errorsMade.find((pm) => pm.category == 'block' && pm.player.id == Number(playerId))?.errorsMade || 0
        let servePoints = errorsMade.find((pm) => pm.category == 'serve' && pm.player.id == Number(playerId))?.errorsMade || 0

        errorsMadeData.labels.push(
          TeammatesService.getTeammateName({
            teammate: row.player.teammate,
            player: row.player
          }) || ('Maglia ' + row.player.shirtNumber))

        errorsMadeData.datasets[0].data.push(spikePoints)
        errorsMadeData.datasets[1].data.push(blockPoints)
        errorsMadeData.datasets[2].data.push(servePoints)
      }
    }
  });
</script>

<BarChart
  data={errorsMadeData}
  rgbBackgroundColor={$theme.dark ? "255, 255, 255" : "100, 100, 100"}
  showYTicks
  showXTicks
  rgbTooltipBackgroundColor={opponent ? ScoutsService.opponentsRgbColors[0] : ScoutsService.friendsRgbColors[0]}
  rgbTooltipColor="255, 255, 255"
  xTickLabel={(tickValue, index, ticks) => {
    return errorsMadeData?.labels[index] || tickValue
  }}
  yTickLabel={(tickValue) => {
    return Number(tickValue) % 1 === 0 ? tickValue : ''
  }}
  yTickStepSize={1}
  yMax={maxPoints}
></BarChart>