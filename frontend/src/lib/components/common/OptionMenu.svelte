<script lang="ts">
	import { MenuOrDrawerOptions, Icon } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	export let options: ComponentProps<MenuOrDrawerOptions>['elements'] = []

	let activator: HTMLElement,
		open: boolean = false
</script>

<div bind:this={activator}>
	<Icon name="mdi-dots-horizontal" click on:click={() => (open = !open)} />
</div>
<MenuOrDrawerOptions elements={options} bind:open bind:activator on:select />
