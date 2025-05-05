<script lang="ts">
	import StandardCheckbox from '$lib/components/common/StandardCheckbox.svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		label: string
		id: string
		value?: boolean
		disabled?: boolean
		text?: import('svelte').Snippet
		onchange?: ComponentProps<typeof StandardCheckbox>['onchange']
	}

	let { label, id, value = $bindable(), disabled = false, text, onchange }: Props = $props()
</script>

<div class="standard-checkbox-container">
	<StandardCheckbox bind:value {id} {onchange} {disabled} />
	<label style:margin-left="0.7rem" for={id}
		>{#if text}{@render text()}{:else}{label}{/if}</label
	>
</div>

<style>
	.standard-checkbox-container {
		display: flex;
		align-items: center;
	}
</style>
