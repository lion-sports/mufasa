<script lang="ts">
	export let open: boolean = false,
		title: string | undefined = undefined,
		_overlayOpacity: string | undefined = '60%'

	import { Dialog } from '@likable-hair/svelte'
</script>

<Dialog bind:open {_overlayOpacity}>
	<div class="card">
		{#if !!title}
			<div class="font-bold text-xl">{title}</div>
		{/if}
		<slot />
	</div>
</Dialog>

<style>
	.card {
		background-color: rgb(var(--global-color-background-300));
		border-radius: 8px;
		padding: 12px;
	}
</style>
