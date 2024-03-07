<script lang="ts" context="module">
	export type Button = {
		label: string
		name: string
		icon?: string
	};
</script>

<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import { createEventDispatcher } from 'svelte'

	let dispatch = createEventDispatcher<{
		change: {}
		click: {
			button: Button
		}
	}>()

	export let buttons: Button[] = [],
		selected: string | undefined = undefined,
		preventDefaultSelection: boolean = false

	function handleButtonClick(button: Button) {
		dispatch('change')
		dispatch('click', {
			button
		})

		if (!preventDefaultSelection) {
			selected = button.name
		}
	}
</script>

<div class="buttons-group-container">
	{#each buttons as button}
		<div
			class="button"
			class:selected={selected == button.name}
			class:total-rounded={buttons.length == 1}
			on:click={() => handleButtonClick(button)}
			on:keypress={() => handleButtonClick(button)}
		>
			{#if !!button.icon}
				<Icon --icon-size="10px" name={button.icon} />
			{/if}
			<span>{button.label}</span>
		</div>
	{/each}
</div>

<style>
	.buttons-group-container {
		display: flex;
		gap: -1px;
		height: 33px;
	}

	.button {
		padding: 5px 10px 5px 10px;
		border: 1px solid var(--global-light-contrast-color);
		cursor: pointer;
	}

	.selected {
		color: var(--global-background-color);
		background-color: rgb(var(--global-color-primary-500));
		border: 0px;
	}

	.button:first-child {
		border-radius: 5px 0px 0px 5px;
	}

	.button:last-child {
		border-radius: 0px 5px 5px 0px;
	}

	.total-rounded {
		border-radius: 5px 5px 5px 5px !important;
	}
</style>
