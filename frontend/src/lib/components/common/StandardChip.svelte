<script lang="ts">
	import { Chip } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		close?: boolean
		closeIcon?: string
		text?: string | undefined
		fontWeight?: number | undefined
		children?: import('svelte').Snippet
		onclick?: ComponentProps<typeof Chip>['onclick']
		onclose?: ComponentProps<typeof Chip>['onclose']
	}

	let {
		close = false,
		closeIcon = 'mdi-close',
		text = undefined,
		fontWeight = undefined,
		children,
		onclick,
		onclose
	}: Props = $props()
</script>

<Chip label {close} {closeIcon} {onclick} {onclose}>
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
