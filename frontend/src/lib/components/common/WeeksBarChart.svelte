<script lang="ts">
  import BarChart from '$lib/components/common/BarChart.svelte'

	let background: string | undefined = $state(undefined)
	onMount(() => {
		let style = getComputedStyle(document.body)
		background = style.getPropertyValue('--global-color-background-200')
	})

	import { Chart as ChartJS, registerables } from 'chart.js'
	import { onMount } from 'svelte'

	ChartJS.register(...registerables)

	interface Props {
		data?: {
			labels: string[]
			datasets: {
				label: string
				data: number[]
				backgroundColor?: string
				borderColor?: string
				hoverBackgroundColor?: string[]
				tension?: number
			}[]
		};
		horizontal?: boolean;
		responsive?: boolean;
		maintainAspectRatio?: boolean;
		showLegend?: boolean;
		showYTicks?: boolean;
		showXTicks?: boolean;
		displayYGrid?: boolean;
		lineWidth?: number;
	}

	let {
		data = $bindable({
			labels: [],
			datasets: []
		}),
		horizontal = false,
		responsive = true,
		maintainAspectRatio = true,
		showLegend = true,
		showYTicks = true,
		showXTicks = true,
		displayYGrid = true,
		lineWidth = 1
	}: Props = $props();

	let gridColor = $derived('rgb(' + (background || '200, 200, 200') + ', .3)')
</script>

<BarChart
	data={$state.snapshot(data)}
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
></BarChart>
