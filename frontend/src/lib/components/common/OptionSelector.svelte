<script lang="ts" module>
	export type Option = {
		name: string
		label: string
		icon?: string
		color?: string
	}
</script>

<script lang="ts">
	import { Icon } from '@likable-hair/svelte'

	import { createEventDispatcher } from 'svelte'
	interface Props {
		options?: Option[]
		padding?: string
		optionPadding?: string
		optionHeight?: string
		optionAppend?: import('svelte').Snippet<[any]>
	}

	let {
		options = [],
		padding = '0px',
		optionPadding = '0px 20px 0px 10px',
		optionHeight = '35px',
		optionAppend
	}: Props = $props()
	const dispatch = createEventDispatcher<{
		'option-click': {
			nativeEvent: MouseEvent
			option: Option
		}
	}>()

	function handleOptionClick(event: MouseEvent, option: Option) {
		dispatch('option-click', {
			option,
			nativeEvent: event
		})
	}
</script>

<div
	style:padding
	style:background-color="rgb(var(--global-color-background-100))"
	style:--option-selector-hover-background-color="rgb(var(--global-color-background-300))"
	class="options-container"
>
	{#each options as option}
		<button
			style:height={optionHeight}
			style:padding={optionPadding}
			class="option-container"
			onclick={(event) => handleOptionClick(event, option)}
		>
			{#if !!option.icon}
				<div style:margin-right="10px">
					<Icon
						name={option.icon}
						--icon-color={option.color || 'rgb(var(--global-color-contrast-900))'}
						--icon-size="12px"
					/>
				</div>
			{/if}
			<div style:color={option.color}>{option.label}</div>
			<div class="spacer"></div>
			<div>
				{@render optionAppend?.({ option })}
			</div>
		</button>
	{/each}
</div>

<style>
	.options-container {
		display: flex;
		flex-direction: column;
	}

	.option-container {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.option-container:hover {
		background-color: var(--option-selector-hover-background-color);
	}

	.spacer {
		flex-grow: 1;
	}
</style>
