<script lang="ts">
	interface Props {
		primaryColor?: string | undefined
		secondaryColor?: string | undefined
		number?: number | undefined
	}

	let { primaryColor = undefined, secondaryColor = undefined, number = undefined }: Props = $props()
</script>

<div class="relative">
	<svg
		width="120"
		height="98"
		viewBox="0 0 120 98"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style:width="var(--shirt-icon-width, 60px)"
		style:height="var(--shirt-icon-height, 60px)"
	>
		<path
			d="M79.9999 85.75H39.9999C38.6738 85.75 37.402 85.3198 36.4643 84.554C35.5266 83.7883 34.9999 82.7496 34.9999 81.6667V49.2858L28.4998 53.5733C26.5498 55.125 23.3999 55.125 21.4499 53.5733L10.9996 39.2575C9.04961 37.665 9.04961 35.0925 10.9996 33.5L36.6999 12.25H43.5C43.5 16.7417 51.6999 20.4167 59.9999 20.4167C68.2999 20.4167 76.9995 16.7417 76.9995 12.25H83.2999L109.5 33.5C111.45 35.0925 111.45 37.665 109.5 39.2575L98.5499 53.5733C96.5999 55.125 93.4499 55.125 91.4999 53.5733L84.9999 49.2858V81.6667C84.9999 82.7496 84.4732 83.7883 83.5355 84.554C82.5978 85.3198 81.326 85.75 79.9999 85.75ZM104.555 36.24L80.8159 17C74.9085 22.4468 68.9069 25.5 59.9996 25.5C51.4996 25.5 43.9995 21.2467 39.4995 17L15.9442 35.74L25.1015 50L36.4643 41H39.4995V81H79.9999V41H82.9995L94.8975 49.5L104.555 36.24Z"
			fill="rgb(var(--global-color-contrast-100))"
		/>
		<path d="M80 41L39.5 80.9999H80V41Z" fill={primaryColor} />
		<path
			d="M25 50.5L15.5 35.5L39.5 17C39.5 17 43 19.5 46 21C50 24 59 25.5 59 25.5L39.5 41.5H36.5L25 50.5Z"
			fill={primaryColor}
		/>
		<path
			d="M59 25.5L39.5 41.5V81L80 41H83L95 49.5L105 36L81 16.5C79.1667 18 77.5 20 71 23.5C69.7827 24.1555 61.6667 25.5 59 25.5Z"
			fill={secondaryColor}
		/>
	</svg>
	<div
		class="absolute top-[40%] left-[37%] bg-[rgb(var(--global-color-background-100))] text-[rgb(var(--global-color-contrast-900))] leading-tight"
	>
		{number || ''}
	</div>
</div>
