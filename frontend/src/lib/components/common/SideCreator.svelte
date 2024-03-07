<script lang="ts" context="module">
	export type Element = {
		label: string
		data?: any
	}
</script>

<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
	import ColorInvertedSelector from '$lib/components/common/ColorInvertedSelector.svelte'
	import { createEventDispatcher } from 'svelte'

	let dispatch = createEventDispatcher<{
		confirm: {
			name: string
		}
	}>()

	export let elements: Element[] = [],
		selectedIndex: number

	let adding: string

	function handleConfirmClick() {
		dispatch('confirm', {
			name: adding
		})
	}

	$: options = elements.map(
		(
			el
		): {
			label: string
			name: string
		} => {
			return {
				label: el.label,
				name: el.label
			}
		}
	)
</script>

<div class="inserting-row">
	<div>
		<StandardTextfield bind:value={adding} placeholder="Nuovo ..." />
	</div>
	<div style:margin-left="10px">
		<Icon name="mdi-check" click on:click={handleConfirmClick} />
	</div>
</div>

<div style:padding-left="2px" style:margin-top="10px">
	<ColorInvertedSelector {options} bind:selectedIndex on:delete />
</div>

<style>
	.inserting-row {
		display: flex;
		align-items: center;
	}
</style>
