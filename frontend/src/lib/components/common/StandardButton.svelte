<script lang="ts">
	import { run } from 'svelte/legacy'

	import { Button } from '@likable-hair/svelte'
	import { createEventDispatcher } from 'svelte'
	import { CircularLoader } from '@likable-hair/svelte'

	interface Props {
		class?: string
		loading?: boolean
		disabled?: boolean
		style?: 'primary' | 'secondary' | 'danger'
		href?: string | undefined
		children?: import('svelte').Snippet
	}

	let {
		class: clazz = '',
		loading = $bindable(false),
		disabled = false,
		style = 'primary',
		href = undefined,
		children
	}: Props = $props()

	let dispatch = createEventDispatcher<{
		click: {
			nativeEvent: MouseEvent
		}
	}>()

	function handleClick(event: { detail: { nativeEvent: MouseEvent } }) {
		if (!disabled && !loading)
			dispatch('click', {
				nativeEvent: event.detail.nativeEvent
			})
	}

	let backgroundColor: string = $state('')
	run(() => {
		if (style == 'primary') backgroundColor = 'rgb(var(--global-color-primary-500))'
		else if (style == 'secondary') backgroundColor = 'rgb(var(--global-color-background-600), .4)'
		else if (style == 'danger') backgroundColor = 'rgb(var(--global-color-error-500))'
	})

	let color: string = $state('')
	run(() => {
		if (style == 'primary') color = 'rgb(var(--global-color-grey-50))'
		else if (style == 'secondary') color = 'rgb(var(--global-color-contrast-900))'
		else if (style == 'danger') color = 'rgb(var(--global-color-grey-50))'
	})

	let activeColor: string = $state('')
	run(() => {
		if (style == 'primary') activeColor = 'rgb(var(--global-color-primary-500), .7)'
		else if (style == 'secondary') activeColor = 'rgb(var(--global-color-primary-500))'
		else if (style == 'danger') activeColor = 'rgb(var(--global-color-error-500), .7)'
	})
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
				{@render children?.()}
			{:else}
				<CircularLoader --circular-loader-height="20px" />
			{/if}
		</div>
	</a>
{:else}
	<Button
		onclick={handleClick}
		{loading}
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
			{@render children?.()}
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
