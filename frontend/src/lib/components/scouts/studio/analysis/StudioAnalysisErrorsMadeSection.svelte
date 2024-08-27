<script lang="ts">
	import type { ScoutAnalysis } from '@/lib/services/scouts/scouts.service'
	import StudioAnalysisErrorsMadeChart from './StudioAnalysisErrorsMadeChart.svelte'
	import lodash from 'lodash'

	export let analysis: ScoutAnalysis

	let dataGroupedByPlayer: Record<
      number,
      {
        player: (typeof analysis.errorsMade)[number]['player']
        errorsMade: (typeof analysis.errorsMade)[number]['errorsMade']
      }
    > = {},
    groupBy: 'category' | 'none' = 'none'

	$: if (!!analysis.errorsMade) {
		dataGroupedByPlayer = {}
		for (let i = 0; i < analysis.errorsMade.length; i += 1) {
			let row = analysis.errorsMade[i]

			if (!dataGroupedByPlayer[row.player.id])
				dataGroupedByPlayer[row.player.id] = lodash.cloneDeep(row)
			else {
				dataGroupedByPlayer[row.player.id].errorsMade =
					dataGroupedByPlayer[row.player.id].errorsMade + row.errorsMade
			}
		}
	}

	$: maxPoint = Object.keys(dataGroupedByPlayer).reduce((p, c: any, i, a) => {
		return Math.max(p, dataGroupedByPlayer[c].errorsMade)
	}, 0)
</script>

<div class="text-2xl font-semibold">Errori</div>
<ul class="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 mt-4">
	<li class="me-2">
		<button
			class="inline-block px-4 py-3 rounded-lg"
      class:text-white={groupBy == 'none'}
      class:bg-blue-600={groupBy == 'none'}
      class:hover:text-gray-900={groupBy !== 'none'}
      class:hover:bg-gray-100={groupBy !== 'none'}
      class:dark:hover:bg-gray-800={groupBy !== 'none'}
      class:dark:hover:text-white={groupBy !== 'none'}
      on:click={() => groupBy = 'none'}
    >
      Totale
    </button>
	</li>
	<li class="me-2">
		<button
			class="inline-block px-4 py-3 rounded-lg"
      class:text-white={groupBy == 'category'}
      class:bg-blue-600={groupBy == 'category'}
      class:hover:text-gray-900={groupBy !== 'category'}
      class:hover:bg-gray-100={groupBy !== 'category'}
      class:dark:hover:bg-gray-800={groupBy !== 'category'}
      class:dark:hover:text-white={groupBy !== 'category'}
      on:click={() => groupBy = 'category'}
		>
      Per tipo
    </button>
	</li>
</ul>
<div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
	<div>
		<StudioAnalysisErrorsMadeChart
			errorsMade={analysis.errorsMade}
			opponent={false}
			maxPoints={maxPoint}
      {groupBy}
		></StudioAnalysisErrorsMadeChart>
	</div>
	<div>
		<StudioAnalysisErrorsMadeChart
			errorsMade={analysis.errorsMade}
			opponent={true}
			maxPoints={maxPoint}
      {groupBy}
		></StudioAnalysisErrorsMadeChart>
	</div>
</div>
