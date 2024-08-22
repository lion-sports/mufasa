<script lang="ts">
	export let progress: number = 0

  // x : 109.9 = progress : 100
  $: dashoffset = 109.9 * (100 - progress) / 100
</script>

<svg
	width="50"
	height="50"
	class="svg"
	viewBox="0 0 50 50"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<circle
		class="MuiCircularProgress-circle MuiCircularProgress-circleDeterminate css-nbfpn7"
		cx="25"
		cy="25"
		r="17.5"
		stroke="black"
		stroke-width="10"
    stroke-dasharray="109.9"
    stroke-dashoffset={dashoffset}
	/>
</svg>

<style>
	.svg {
		height: var(--circular-progress-indicator-height, 20px);
		width: var(--circular-progress-indicator-width, 20px);
    transform: rotate(-90deg);
	}

	.MuiCircularProgress-circle {
		color: var(--circular-progress-indicator-color, rgb(144, 202, 249));
		fill: none;
		stroke: currentcolor;
		transition: stroke-dashoffset 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
