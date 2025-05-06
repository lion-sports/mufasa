<script lang="ts">
	interface Props {
		color?: string
		weight?: string
		radius?: string
		marginTop?: string | undefined
		marginBottom?: string | undefined
		marginLeft?: string | undefined
		marginRight?: string | undefined
	}

	let {
		color = 'rgb(var(--global-color-background-500), .5)',
		weight = '1px',
		radius = '0.5px',
		marginTop = '10px',
		marginBottom = '10px',
		marginLeft = '5px',
		marginRight = '5px'
	}: Props = $props()
</script>

<div
	style:background-color={color}
	style:border-radius={radius}
	style:height={weight}
	style:margin-top={marginTop}
	style:margin-bottom={marginBottom}
	style:margin-right={marginRight}
	style:margin-left={marginLeft}
></div>
