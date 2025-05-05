<script lang="ts">
	import { goto } from '$app/navigation'
  import { Icon } from '@likable-hair/svelte'

	interface Props {
		title: string;
		subtitle?: string;
		marginTop?: string;
		paddingTop?: string;
		prependVisible?: boolean;
		prependRoute?: string | undefined;
		prepend?: import('svelte').Snippet;
		titleSnippet?: import('svelte').Snippet;
		append?: import('svelte').Snippet;
	}

	let {
		title,
		subtitle = '',
		marginTop = '',
		paddingTop = '',
		prependVisible = false,
		prependRoute = undefined,
		prepend,
		titleSnippet,
		append
	}: Props = $props();

	function handleBackClick() {
		if (!prependRoute) window.history.back()
		else goto(prependRoute)
	}
</script>

<div style:margin-top={marginTop} style:padding-top={paddingTop}>
	{#if prependVisible}
		<div style:margin-right="15px">
			{#if prepend}{@render prepend()}{:else}
				<button onclick={handleBackClick} style:cursor="pointer" class="prepend-button">
					<div class="back-icon">
						<Icon name="mdi-arrow-left" />
					</div>
					<span style:margin-left="10px"> Indietro </span>
				</button>
			{/if}
		</div>
	{/if}
	<div style:display="flex" style:align-items="center">
		<div style:font-weight="700" style:font-size="22pt">
			{#if titleSnippet}{@render titleSnippet()}{:else}
				<div class="mt-2 mb-1 text-4xl font-bold title">
					{title}
				</div>
				<div class="mb-4 text-base font-normal">
					{subtitle}
				</div>
			{/if}
		</div>
		<div style:flex-grow="1" ></div>
		<div>
			{@render append?.()}
		</div>
	</div>
</div>

<style>
	.prepend-button {
		display: flex;
	}

	.back-icon {
		transition: all 0.2s;
	}

	.prepend-button:hover .back-icon {
		transform: translateX(-8px);
	}

	.title {
		color: rgb(var(--global-color-contrast-800));
	}
</style>
