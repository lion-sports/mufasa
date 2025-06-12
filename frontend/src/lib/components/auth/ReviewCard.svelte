<script lang="ts">
	import { ToolTip } from '@likable-hair/svelte'
	import { elasticIn, elasticInOut } from 'svelte/easing'
	import { slide } from 'svelte/transition'

	interface Props {
		reviewContent: import('svelte').Snippet
		icon: import('svelte').Snippet
		onclick: () => void
	}

	let { reviewContent, icon, onclick }: Props = $props()

	// let activator: HTMLElement | undefined = $state()
</script>

<!-- {#if activator}
	<ToolTip bind:activator appearTimeout={100}>
		<div class="bg-[rgb(var(--global-color-background-200))] p-1 rounded-sm">AAAAA</div>
	</ToolTip>
{/if} -->

<button {onclick}>
	<div
		class="p-2.5 border border-[rgb(var(--global-color-background-400))] hover:bg-[rgb(var(--global-color-background-200))] rounded-md shadow-sm"
	>
		<div class="w-full flex gap-3">
			<div class="flex flex-col items-center justify-center">
				{@render icon()}
			</div>
			<div class="w-full flex flex-col text-sm text-[rgb(var(--global-color-contrast-500))]">
				{@render reviewContent()}
			</div>
		</div>
	</div>
</button>
