<script lang="ts" context="module">
</script>

<script lang="ts">
	export let collapsed: boolean = false,
		title: string | undefined = undefined

	import { Icon } from '@likable-hair/svelte'
	import { slide } from 'svelte/transition'
</script>

<div class="panel">
	<button class="title-container" on:click={() => (collapsed = !collapsed)}>
		<slot name="header" {collapsed}>
			<slot name="title" {collapsed}>
				<div class="title">{title}</div>
			</slot>
			<div class="expand-icon" class:reverse={!collapsed}>
				<Icon name="mdi-menu-down" />
			</div>
		</slot>
	</button>
	{#if !collapsed}
		<div transition:slide|local={{ duration: 200 }}>
			<slot />
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
