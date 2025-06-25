<script lang="ts">
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

	let backgroundColor: string = $derived.by(() => {
    let backgroundColor = ''
    if (style == 'primary') backgroundColor = 'rgb(var(--global-color-primary-500))'
		else if (style == 'secondary') backgroundColor = 'transparent'
		else if (style == 'danger') backgroundColor = 'rgb(var(--global-color-error-500))'
    return backgroundColor
  })

  let color: string = $derived.by(() => {
    if (style == 'primary') return 'rgb(var(--global-color-grey-50))'
    else if (style == 'secondary') return 'rgb(var(--global-color-contrast-900))'
    else if (style == 'danger') return 'rgb(var(--global-color-grey-50))'
    return ''
  })

  let activeColor: string = $derived.by(() => {
    if (style == 'primary') return 'rgb(var(--global-color-primary-500), .7)'
    else if (style == 'secondary') return 'rgb(var(--global-color-primary-500))'
    else if (style == 'danger') return 'rgb(var(--global-color-error-500), .7)'
    return ''
  })

  let boxShadow: string = $derived.by(() => {
    if (style == 'secondary') return '0 0 0 2px rgb(var(--global-color-primary-500), .6)'
    return ''
  })
</script>

{#if !!href}
	<a
		style:--link-button-background-color={backgroundColor}
		style:--link-button-hover-background-color={activeColor}
		style:--link-button-active-background-color={activeColor}
		style:--link-button-focus-background-color={activeColor}
		style:--link-button-color={color}
    style:--link-button-box-shadow={boxShadow}
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
    --button-box-shadow={boxShadow}
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
    box-shadow: var(--link-button-box-shadow);
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
