<script lang="ts" module>
	export type Chip = {
		label: string
		value: number | string
	}
</script>

<script lang="ts">
	interface Props {
		chips?: Chip[];
		value?: Chip[];
	}

	let { chips = $bindable([]), value = $bindable([]) }: Props = $props();

	function toggleSelection(chip: Chip) {
		if (!value) value = []

		if (value.map((el) => el.value).includes(chip.value)) {
			value = value.filter((v) => v.value !== chip.value)
		} else {
			value = [...value, chip]
		}
	}
</script>

<div class="container">
	{#each chips as chip}
		<button
			type="button"
			class="chip"
			class:selected={value.map((el) => el.value).includes(chip.value)}
			class:unselected={!value.map((el) => el.value).includes(chip.value)}
			onclick={() => toggleSelection(chip)}>{chip.label}</button
		>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.chip {
		padding: 10px;
		cursor: pointer;
		border-radius: 5px;
		transition: all 0.1s ease-in;
		user-select: none;
		font-size: 0.8rem;
	}

	.chip.unselected {
		background-color: rgb(var(--global-color-background-300));
		color: rgb(var(--global-color-primary-500));
		border: 1px solid rgb(var(--global-color-primary-500));
	}

	.chip.selected {
		background-color: rgb(var(--global-color-primary-500));
		color: rgb(var(--global-color-background-300));
		border: 1px solid rgb(var(--global-color-primary-500));
	}
</style>
