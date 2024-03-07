<script lang="ts">
	let clazz: {
		label?: string
		input?: {
			container?: string
			row?: string
			input?: string
		}
	} = {}
	export { clazz as class }

	export let value: string | undefined = undefined,
		label: string | undefined = undefined,
		placeholder: string = '',
		name: string,
		type: 'password' | 'text' | 'number' = 'text',
		readonly: boolean = false,
		error: boolean = false,
		disabled: boolean = false

	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'
</script>

<label style:font-weight="500" style:margin-left="3px" for={name} class={clazz.label}
	>{label || ''}</label
>
<div style:margin-top="5px">
	<StandardTextfield
		bind:value
		{type}
		{readonly}
		{error}
		{disabled}
		{placeholder}
		on:input
		on:focus
		class={clazz.input}
	>
		<svelte:fragment slot="append-inner">
			<slot name="append-inner" />
		</svelte:fragment>
	</StandardTextfield>
</div>
