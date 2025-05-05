<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import CircularProgressIndicator from '../../common/CircularProgressIndicator.svelte'

	interface Props {
		icon: string
		progress?: number | undefined
		iconClass?: string | undefined
		children?: import('svelte').Snippet
		onclick?: (event: MouseEvent) => void
	}

	let { icon, progress = undefined, iconClass = undefined, children, onclick }: Props = $props()
</script>

<button
	class="text-left p-2 rounded-md w-full hover:bg-[var(--hover-background-color)] bg-[var(--background-color)] flex items-center gap-2"
	{onclick}
>
	<div class="mr-2 {iconClass || ''}">
		<Icon name={icon}></Icon>
	</div>
	<div>
		{@render children?.()}
	</div>
	<div class="ml-auto">
		{#if progress !== undefined}
			<CircularProgressIndicator {progress}></CircularProgressIndicator>
		{/if}
	</div>
</button>
