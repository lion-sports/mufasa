<script lang="ts">
	interface Props {
		subtitle?: string;
		marginBottom?: string;
		marginTop?: string;
		paddingTop?: string;
		children?: import('svelte').Snippet;
	}

	let {
		subtitle = '',
		marginBottom = '',
		marginTop = '',
		paddingTop = '',
		children
	}: Props = $props();
</script>

<div
	style:font-weight="600"
	style:font-size="1.6rem"
	style:margin-top={marginTop}
	style:padding-top={paddingTop}
	style:margin-bottom={marginBottom}
>
	{#if children}{@render children()}{:else}
		{subtitle}
	{/if}
</div>
