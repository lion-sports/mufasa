<script lang="ts">
	import { goto } from '$app/navigation'

	export let title: string,
		subtitle: string = '',
		marginTop: string = '',
		paddingTop: string = '',
		prependVisible: boolean = false,
		prependRoute: string | undefined = undefined

	function handleBackClick() {
		if (!prependRoute) window.history.back()
		else goto(prependRoute)
	}
	import { Icon } from '@likable-hair/svelte'
</script>

<div style:margin-top={marginTop} style:padding-top={paddingTop}>
	{#if prependVisible}
		<div style:margin-right="15px">
			<slot name="prepend">
				<div on:click={handleBackClick} on:keypress style:cursor="pointer" class="prepend-button">
					<div class="back-icon">
						<Icon name="mdi-arrow-left" click={true} />
					</div>
					<span style:margin-left="10px"> Indietro </span>
				</div>
			</slot>
		</div>
	{/if}
	<div style:display="flex" style:align-items="center">
		<div style:font-weight="700" style:font-size="22pt">
			<slot name="title">
				<div class="mt-2 ml-2 mb-1 text-4xl font-bold title">
					{title}
				</div>
				<div class="ml-2 mb-4 text-base font-normal">
					{subtitle}
				</div>
			</slot>
		</div>
		<div style:flex-grow="1" />
		<div>
			<slot name="append" />
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
