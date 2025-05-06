<script lang="ts">
	import { run } from 'svelte/legacy'

	import { LineChart } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		absences?: Record<
			number,
			{
				team: {
					id: number
					name: string
				}
				absences: {
					eventId: number
					absencesNumber: number
				}[]
			}
		>
	}

	let { absences = {} }: Props = $props()

	let data: ComponentProps<typeof LineChart>['data'] = $state({
		labels: [],
		datasets: []
	})

	let backgroundColors = ['#ED1C2480', '#4C061D80', '#F4B9B280', '#F42C0480', '#C73E1D80']

	run(() => {
		if (!!absences) {
			data = {
				labels: Array.from({ length: 10 }, (_, index) => index + 1).map((v) => v.toString()),
				datasets: []
			}

			for (const [teamId, teamValue] of Object.entries(absences)) {
				let dataset: NonNullable<ComponentProps<typeof LineChart>['data']>['datasets'][0] = {
					label: teamValue.team.name,
					data: teamValue.absences.map((a) => a.absencesNumber),
					backgroundColor: backgroundColors[data.datasets.length % backgroundColors.length],
					borderColor: backgroundColors[data.datasets.length % backgroundColors.length],
					tension: 0.2
				}

				data.datasets.push(dataset)
			}
		}
	})
</script>

<LineChart data={$state.snapshot(data)} showXTicks></LineChart>
