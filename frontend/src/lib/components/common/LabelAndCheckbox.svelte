<script lang="ts">
	import StandardCheckbox from '$lib/components/common/StandardCheckbox.svelte'

	interface Props {
		label: string;
		id: string;
		value?: boolean;
		disabled?: boolean;
		text?: import('svelte').Snippet;
	}

	let {
		label,
		id,
		value = $bindable(false),
		disabled = false,
		text
	}: Props = $props();
</script>

<div class="standard-checkbox-container">
	<StandardCheckbox bind:value {id} on:change {disabled} />
	<label style:margin-left="0.7rem" for={id}>{#if text}{@render text()}{:else}{label}{/if}</label>
</div>

<style>
	.standard-checkbox-container {
		display: flex;
		align-items: center;
	}
</style>
