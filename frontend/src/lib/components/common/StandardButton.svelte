<script lang="ts">
	import { Button } from '@likable-hair/svelte'
	import { createEventDispatcher } from 'svelte'
	import { CircularLoader } from '@likable-hair/svelte'

	let clazz: string = ''
	export { clazz as class }

	export let loading: boolean = false,
		disabled: boolean = false,
		style: 'primary' | 'secondary' | 'danger' = 'primary',
		href: string | undefined = undefined

	let dispatch = createEventDispatcher<{
		click: {
			nativeEvent: MouseEvent
		}
	}>()

	function handleClick(event: CustomEvent<{ nativeEvent: MouseEvent }>) {
		if (!disabled && !loading)
			dispatch('click', {
				nativeEvent: event.detail.nativeEvent
			})
	}

	let backgroundColor: string
	$: if (style == 'primary') backgroundColor = 'rgb(var(--global-color-primary-500))'
	else if (style == 'secondary') backgroundColor = 'rgb(var(--global-color-background-600), .4)'
	else if (style == 'danger') backgroundColor = 'rgb(var(--global-color-error-500))'

	let color: string
	$: if (style == 'primary') color = 'rgb(var(--global-color-primary-foreground))'
	else if (style == 'secondary') color = 'rgb(var(--global-color-contrast-900))'
	else if (style == 'danger') color = 'rgb(var(--global-color-grey-50))'

	let activeColor: string
	$: if (style == 'primary') activeColor = 'rgb(var(--global-color-primary-500), .7)'
	else if (style == 'secondary') activeColor = 'rgb(var(--global-color-primary-500))'
	else if (style == 'danger') activeColor = 'rgb(var(--global-color-error-500), .7)'
</script>

{#if !!href}
	<a
		style:--link-button-background-color={backgroundColor}
		style:--link-button-hover-background-color={activeColor}
		style:--link-button-active-background-color={activeColor}
		style:--link-button-focus-background-color={activeColor}
		style:--link-button-color={color}
		class:disabled
		class="link-button"
		{href}
	>
		<div class="flex items-center justify-center h-full whitespace-nowrap">
			{#if !loading}
				<slot />
			{:else}
				<CircularLoader --circular-loader-height="20px" />
			{/if}
		</div>
	</a>
{:else}
	<Button
		on:click={handleClick}
		bind:loading
		{disabled}
		class="!box-border {clazz || ''}"
		--button-padding="10px 20px 10px 20px"
		--button-background-color={backgroundColor}
		--button-hover-background-color={activeColor}
		--button-active-background-color={activeColor}
		--button-focus-background-color={activeColor}
		--button-color={color}
		--circular-loader-height="20px"
	>
		<div
			style:display="flex"
			style:align-items="center"
			style:justify-content="center"
			style:height="100%"
			style:white-space="nowrap"
		>
			<slot />
		</div>
	</Button>
{/if}

<style>
	.link-button {
		display: block;
		padding: 10px 20px 10px 20px;
		border-radius: 8px;
		background-color: var(--link-button-background-color);
		color: var(--link-button-color);
		transition: all 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
	}

	.link-button:hover {
		background-color: var(--link-button-hover-background-color);
	}

	.link-button:focus {
		background-color: var(--link-button-focus-background-color);
	}

	.link-button:active {
		background-color: var(--link-button-active-background-color);
	}

	.link-button.disabled {
		pointer-events: none;
		opacity: 0.8;
		cursor: not-allowed;
	}
</style>
