<script lang="ts">
	import { run } from 'svelte/legacy'

	import { LineChart } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		presences?: Record<
			number,
			{
				team: {
					id: number
					name: string
				}
				presences: {
					eventId: number
					presencesNumber: number
				}[]
			}
		>
	}

	let { presences = {} }: Props = $props()

	let data: ComponentProps<typeof LineChart>['data'] = $state({
		labels: [],
		datasets: []
	})

	let backgroundColors = ['#297DB780', '#A0CFD380', '#4ECDC480', '#A6ECE080', '#78FFD680']

	run(() => {
		if (!!presences) {
			data = {
				labels: Array.from({ length: 10 }, (_, index) => index + 1).map((v) => v.toString()),
				datasets: []
			}

			for (const [teamId, teamValue] of Object.entries(presences)) {
				let dataset: NonNullable<ComponentProps<typeof LineChart>['data']>['datasets'][0] = {
					label: teamValue.team.name,
					data: teamValue.presences.map((a) => a.presencesNumber),
					backgroundColor: backgroundColors[data.datasets.length % backgroundColors.length],
					borderColor: backgroundColors[data.datasets.length % backgroundColors.length],
					tension: 0.2
				}

				data.datasets.push(dataset)
			}

			data = { ...data }
		}
	})
</script>

<LineChart data={$state.snapshot(data)} showXTicks></LineChart>
