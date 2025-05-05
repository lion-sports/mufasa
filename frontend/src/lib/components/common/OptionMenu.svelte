<script lang="ts">
	import { MenuOrDrawerOptions, Icon } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		options?: ComponentProps<typeof MenuOrDrawerOptions>['elements']
    onselect: ComponentProps<typeof MenuOrDrawerOptions>['onselect']
	}

	let { options = [], onselect }: Props = $props();

	let activator: HTMLElement | undefined = $state(),
		open: boolean = $state(false)
</script>

<div bind:this={activator}>
	<Icon name="mdi-dots-horizontal" onclick={() => (open = !open)} />
</div>
<MenuOrDrawerOptions elements={options} bind:open bind:activator {onselect} />
