<script lang="ts">
	import { Bar } from 'svelte-chartjs'

	let background: string | undefined = undefined
	onMount(() => {
		let style = getComputedStyle(document.body)
		background = style.getPropertyValue('--global-color-background-200')
	})

	import { Chart as ChartJS, registerables } from 'chart.js'
	import { onMount } from 'svelte'

	ChartJS.register(...registerables)

	export let data: {
			labels: string[]
			datasets: {
				label: string
				data: number[]
				backgroundColor?: string
				borderColor?: string
				hoverBackgroundColor?: string[]
				tension?: number
			}[]
		} = {
			labels: [],
			datasets: []
		},
		horizontal: boolean = false,
		responsive: boolean = true,
		maintainAspectRatio: boolean = true,
		showLegend: boolean = true,
		showYTicks: boolean = true,
		showXTicks: boolean = true,
		displayYGrid: boolean = true,
		lineWidth: number = 1

	$: gridColor = 'rgb(' + (background || '200, 200, 200') + ', .3)'
</script>

<Bar
	bind:data
	options={{
		indexAxis: horizontal ? 'y' : 'x',
		responsive: responsive,
		maintainAspectRatio: maintainAspectRatio,
		plugins: {
			legend: {
				display: showLegend
			},
		},
		interaction: {
			intersect: false
		},
		scales: {
			x: {
				display: true,
				title: {
					display: true
				},
				grid: {
					display: false
				},
				border: {
					display: false
				},
				ticks: {
					display: showYTicks
				}
			},
			y: {
				display: displayYGrid,
				title: {},
				grid: {
					lineWidth: lineWidth,
					color: gridColor
				},
				border: {
					dash: [10, 10],
					display: false
				},
				ticks: {
					display: showXTicks
				}
			}
		}
	}}
></Bar>
