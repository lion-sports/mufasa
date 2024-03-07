<script lang="ts">
	export let value: string | undefined,
		label: string,
		placeholder: string = '',
		name: string

	import StandardTextarea from '$lib/components/common/StandardTextarea.svelte'
</script>

<label style:font-weight="500" style:margin-left="3px" for={name}>{label}</label>
<div style:margin-top="5px">
	<StandardTextarea bind:value label={placeholder} on:input />
</div>
