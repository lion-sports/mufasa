<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import { slide } from 'svelte/transition'
	interface Props {
		collapsed?: boolean
		title?: string | undefined
		children?: import('svelte').Snippet
	}

	let { collapsed = $bindable(false), title = undefined, children }: Props = $props()
</script>

<div class="panel">
	<button class="title-container" onclick={() => (collapsed = !collapsed)}>
		<div class="title">{title}</div>
		<div class="expand-icon" class:reverse={!collapsed}>
			<Icon name="mdi-menu-down" />
		</div>
	</button>
	{#if !collapsed}
		<div transition:slide|local={{ duration: 200 }}>
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
	.reverse {
		transform: rotate(180deg);
	}

	.expand-icon {
		transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
	}

	.panel {
		background-color: rgb(var(--global-color-background-300));
		padding: 10px;
		border-radius: 5px;
		height: fit-content;
	}

	.title-container {
		display: flex;
	}

	.title {
		font-weight: 700;
		font-size: 1.2rem;
		flex-grow: 1;
	}
</style>
