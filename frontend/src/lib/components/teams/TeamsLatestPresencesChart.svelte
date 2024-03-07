<script lang="ts">
  import { GanymedeLineChart } from "@likable-hair/svelte";
	import type { ComponentProps } from "svelte"

  export let presences: Record<number, {
    team: {
      id: number,
      name: string
    },
    presences: {
      eventId: number,
      presencesNumber: number
    }[]
  }> = {}

  let data: ComponentProps<GanymedeLineChart>['data']

  let backgroundColors = [
    '#297DB780',
    '#A0CFD380',
    '#4ECDC480',
    '#A6ECE080',
    '#78FFD680'
  ]

  $: if(!!presences) {
    data = {
      labels: Array.from({ length: 10 }, (_, index) => index + 1).map((v) => v.toString()),
      datasets: []
    }

    for(const [teamId, teamValue] of Object.entries(presences)) {
      let dataset: NonNullable<ComponentProps<GanymedeLineChart>['data']>['datasets'][0] = {
        label: teamValue.team.name,
        data: teamValue.presences.map((a) => a.presencesNumber),
        backgroundColor: backgroundColors[data.datasets.length % backgroundColors.length],
        borderColor: backgroundColors[data.datasets.length % backgroundColors.length],
        tension: .2
      }

      data.datasets.push(dataset)
    }

    data = {...data}
  }
</script>

<GanymedeLineChart
  {data}
  showXTicks
></GanymedeLineChart>