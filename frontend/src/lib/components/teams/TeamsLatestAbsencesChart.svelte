<script lang="ts">
  import { GanymedeLineChart } from "@likable-hair/svelte";
	import type { ComponentProps } from "svelte"

  export let absences: Record<number, {
    team: {
      id: number,
      name: string
    },
    absences: {
      eventId: number,
      absencesNumber: number
    }[]
  }> = {}

  let data: ComponentProps<GanymedeLineChart>['data']

  let backgroundColors = [
    '#ED1C2480',
    '#4C061D80',
    '#F4B9B280',
    '#F42C0480',
    '#C73E1D80'
  ]

  $: if(!!absences) {
    data = {
      labels: Array.from({ length: 10 }, (_, index) => index + 1).map((v) => v.toString()),
      datasets: []
    }

    for(const [teamId, teamValue] of Object.entries(absences)) {
      let dataset: NonNullable<ComponentProps<GanymedeLineChart>['data']>['datasets'][0] = {
        label: teamValue.team.name,
        data: teamValue.absences.map((a) => a.absencesNumber),
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