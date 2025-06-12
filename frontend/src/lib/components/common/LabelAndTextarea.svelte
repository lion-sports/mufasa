<script lang="ts">
	import StandardTextarea from '$lib/components/common/StandardTextarea.svelte'
	interface Props {
		value?: string
		label: string
		placeholder?: string
		name: string
	}

	let { value = $bindable(), label, placeholder = '', name }: Props = $props()
</script>

<label style:font-weight="500" style:margin-left="3px" for={name}>{label}</label>
<div style:margin-top="5px">
	<StandardTextarea bind:value label={placeholder} />
</div>
