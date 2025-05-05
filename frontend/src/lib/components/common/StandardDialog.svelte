<script lang="ts">

	import { Dialog } from '@likable-hair/svelte'
	interface Props {
		open: boolean;
		title?: string | undefined;
		_overlayOpacity?: string | undefined;
		children?: import('svelte').Snippet;
	}

	let {
		open = $bindable(),
		title = undefined,
		_overlayOpacity = '60%',
		children
	}: Props = $props();
</script>

<Dialog bind:open {_overlayOpacity}>
  <div class="card">
    {#if !!title}
      <div class="font-bold text-xl">{title}</div>
    {/if}
    {@render children?.()}
  </div>
</Dialog>

<style>
	.card {
		background-color: rgb(var(--global-color-background-300));
		border-radius: 8px;
		padding: 12px;
	}
</style>
