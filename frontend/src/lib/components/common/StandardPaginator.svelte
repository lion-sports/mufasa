<script lang="ts">
	import { run } from 'svelte/legacy';

	import { Icon } from '@likable-hair/svelte'
	import { createEventDispatcher } from 'svelte'
	let dispatch = createEventDispatcher<{
		change: {
			page: number
		}
	}>()

	interface Props {
		page?: number;
		maxPage?: number | undefined;
	}

	let { page = $bindable(1), maxPage = undefined }: Props = $props();

	function goToPage(p: number) {
		if (p <= 0 || (!!maxPage && p > maxPage)) return
		page = p
		emitChange()
	}

	function previousPage() {
		if (page == 1) return
		page -= 1
		emitChange()
	}

	function hardPrevious() {
		page = 1
		emitChange()
	}

	function nextPage() {
		if (!!maxPage && page >= maxPage) return
		page += 1
		emitChange()
	}

	function hardNext() {
		if (!maxPage) return
		page = maxPage
		emitChange()
	}

	function emitChange() {
		dispatch('change', {
			page
		})
	}

	run(() => {
		if (!!maxPage && page > maxPage) page = maxPage
	});
</script>

<div class="container">
	<Icon click on:click={hardPrevious} name="mdi-chevron-double-left" />
	<Icon click on:click={previousPage} name="mdi-chevron-left" />
	{#if page != 1}
		<div class="page-button" style:cursor="pointer" onclick={() => goToPage(page - 1)}>
			{page - 1}
		</div>
	{/if}
	<div class="page-button" class:selected={true}>
		{page}
	</div>
	{#if !maxPage || (!!maxPage && page < maxPage)}
		<div class="page-button" style:cursor="pointer" onclick={() => goToPage(page + 1)}>
			{page + 1}
		</div>
	{/if}
	<Icon click on:click={nextPage} name="mdi-chevron-right" />
	{#if !!maxPage}
		<Icon click on:click={hardNext} name="mdi-chevron-double-right" />
	{/if}
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.page-button {
		border-radius: 3px;
		display: flex;
		justify-content: center;
		align-content: center;
		width: 25px;
		height: 25px;
	}

	.selected {
		background-color: rgb(var(--global-color-primary-500));
		color: var(--global-background-color);
		cursor: default;
	}
</style>
