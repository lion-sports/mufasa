<script lang="ts">

	import { Chip } from '@likable-hair/svelte'
	interface Props {
		close?: boolean;
		closeIcon?: string;
		text?: string | undefined;
		fontWeight?: number | undefined;
		children?: import('svelte').Snippet;
	}

	let {
		close = false,
		closeIcon = 'mdi-close',
		text = undefined,
		fontWeight = undefined,
		children
	}: Props = $props();
</script>

<Chip label {close} {closeIcon} on:click on:close>
	<div
		style:min-height="30px"
		style:display="flex"
		style:align-items="center"
		style:font-weight={fontWeight}
	>
		{#if children}{@render children()}{:else}
			{text}
		{/if}
	</div>
</Chip>
