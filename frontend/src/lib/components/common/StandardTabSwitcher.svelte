<script lang="ts" module>
	export type Tab = {
		name: string
		label: string
		icon?: string
	}
</script>

<script lang="ts">
	import { TabSwitcher } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
	interface Props {
		tabs?: Tab[]
		selected: string
		marginTop?: string | undefined
		marginBottom?: string | undefined
		ontabClick?: ComponentProps<typeof TabSwitcher>['ontabClick']
		append?: import('svelte').Snippet
	}

	let {
		tabs = [],
		selected = $bindable(),
		marginTop = undefined,
		marginBottom = undefined,
		append,
		ontabClick = undefined
	}: Props = $props()

	const append_render = $derived(append)
</script>

<div style:margin-top={marginTop} style:margin-bottom={marginBottom}>
	<TabSwitcher {tabs} bind:selected {ontabClick}>
		{#snippet appendSnippet()}
			{@render append_render?.()}
		{/snippet}
	</TabSwitcher>
</div>
