<script lang="ts">
	import { SimpleTextField, Icon } from '@likable-hair/svelte'

	let clazz: {
		container?: string
		row?: string
		input?: string
	} = {}
	export { clazz as class }

	export let placeholder: string = '',
		value: string | number = '',
		type: 'text' | 'number' | 'password' | 'time' = 'text',
		error: boolean = false,
		disabled: boolean = false,
		readonly: boolean = false,
		valueRequired: boolean = false,
		appendIcon: string | undefined = undefined,
		appendInnerIcon: string | undefined = undefined

	$: localError = (valueRequired && value?.toString().length == 0) || error
</script>

<SimpleTextField
	{placeholder}
	bind:value
	{type}
	{disabled}
	{readonly}
	{appendIcon}
	{appendInnerIcon}
	on:input
	on:focus
	class={clazz}
	--simple-textfield-height="40px"
	--simple-textfield-border={localError
		? '1px solid rgb(var(--global-color-error-600))'
		: undefined}
>
	<svelte:fragment slot="prepend-inner">
		<slot name="prepend-inner" />
	</svelte:fragment>
	<slot name="append-inner" slot="append-inner">
		{#if !!appendInnerIcon}
			<Icon name={appendInnerIcon} />
		{/if}
	</slot>
</SimpleTextField>
