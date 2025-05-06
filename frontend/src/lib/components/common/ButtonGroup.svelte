<script lang="ts" generics="Button extends { value: number | string }">
	import { createEventDispatcher } from 'svelte'

	interface Props {
		buttons?: Button[]
		selectedButton?: string | number | undefined
		children?: import('svelte').Snippet<[any]>
	}

	let { buttons = [], selectedButton = $bindable(undefined), children }: Props = $props()

	let dispatch = createEventDispatcher<{
		click: {
			button: Button
		}
	}>()
</script>

<div class="flex gap-2 flex-col md:flex-row w-full">
	{#each buttons as button}
		<button
			onclick={() => {
				selectedButton = button.value
				dispatch('click', { button })
			}}
			class="w-full md:max-w-[300px]"
			class:selected={selectedButton == button.value}
		>
			{@render children?.({ button, selected: selectedButton == button.value })}
		</button>
	{/each}
</div>

<style>
	button {
		border: 1px solid rgb(var(--global-color-primary-500));
		padding: 16px;
		border-radius: 8px;
	}

	button.selected {
		background-color: rgb(var(--global-color-primary-500));
		color: rgb(var(--global-color-grey-50));
	}
</style>
