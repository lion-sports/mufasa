<script lang="ts" context="module">
	import type { Option } from '$lib/components/common/StandardSelect.svelte'
</script>

<script lang="ts">
	export let value: string | number | undefined = undefined,
		label: string,
		name: string,
		options: Option[],
		disabled: boolean = false

	import StandardSelect from './common/StandardSelect.svelte'
</script>

<label style:font-weight="500" style:margin-left="3px" for={name}>{label}</label>
<div style:margin-top="5px">
	<StandardSelect bind:value {options} {disabled} on:change />
</div>
