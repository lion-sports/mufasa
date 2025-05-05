<script lang="ts">
  import { run } from 'svelte/legacy';

  import WeeksBarChart from "$lib/components/common/WeeksBarChart.svelte";
	import type { ComponentProps } from "svelte"

  interface Props {
    data?: {
    team: {
      id: number,
      name: string
    }
    teammate: {
      id: number,
      alias: string
    }
    user: {
      email: string
      firstname?: string
      lastname?: string
    }
    absenceCount: number
  }[];
  }

  let { data = [] }: Props = $props();

  let chartData: ComponentProps<typeof WeeksBarChart>['data'] = $state()

  let backgroundColors = [
    '#ED1C2480',
    '#4C061D80',
    '#F4B9B280',
    '#F42C0480',
    '#C73E1D80'
  ]

  run(() => {
    if(!!data) {
      chartData = {
        labels: [],
        datasets: []
      }

      let teamIndexes: Record<number, number> = {}
      let userIndexes: Record<string, number> = {}
      for(let i = 0; i < data.length; i += 1) {
        let team = data[i].team
        let user = data[i].user
        let absencesCount = data[i].absenceCount

        if(teamIndexes[team.id] === undefined) {
          teamIndexes[team.id] = chartData.datasets.length
          chartData.datasets.push({
            label: team.name,
            data: [],
            backgroundColor: backgroundColors[chartData.datasets.length % backgroundColors.length],
            borderColor: backgroundColors[chartData.datasets.length % backgroundColors.length],
            tension: .2
          })
        }

        if(userIndexes[user.email] === undefined) {
          userIndexes[user.email] = chartData.labels.length
          chartData.datasets[teamIndexes[team.id]].data[userIndexes[user.email]] = absencesCount
          chartData.labels[userIndexes[user.email]] = user.firstname + ' ' + user.lastname
        } else {
          chartData.datasets[teamIndexes[team.id]].data[userIndexes[user.email]] = absencesCount
        }

      }

      chartData = {...chartData}
    }
  });
</script>

<WeeksBarChart
  data={$state.snapshot(chartData)}
  showXTicks
></WeeksBarChart>