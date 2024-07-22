<script lang="ts">
	import StandardCheckbox from '$lib/components/common/StandardCheckbox.svelte'

	export let label: string,
		id: string,
		value: boolean = false,
		disabled: boolean = false
</script>

<div class="standard-checkbox-container">
	<StandardCheckbox bind:value {id} on:change {disabled} />
	<label style:margin-left="0.7rem" for={id}><slot name="text">{label}</slot></label>
</div>

<style>
	.standard-checkbox-container {
		display: flex;
		align-items: center;
	}
</style>
