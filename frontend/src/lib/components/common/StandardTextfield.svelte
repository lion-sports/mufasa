<script lang="ts">
	import { SimpleTextField, Icon } from '@likable-hair/svelte'
	import { type ComponentProps } from 'svelte'

	interface Props {
		class?: {
			container?: string
			row?: string
			input?: string
		}
		placeholder?: string
		value?: string | number | undefined
		type?: 'text' | 'number' | 'password' | 'time'
		error?: boolean
		disabled?: boolean
		readonly?: boolean
		valueRequired?: boolean
		appendIcon?: string | undefined
		appendInnerIcon?: string | undefined
		prependInner?: import('svelte').Snippet
		appendInner?: import('svelte').Snippet
	}

	let {
		class: clazz = {},
		placeholder = '',
		value = $bindable(undefined),
		type = 'text',
		error = false,
		disabled = false,
		readonly = false,
		valueRequired = false,
		appendIcon = undefined,
		appendInnerIcon = undefined,
		prependInner,
		appendInner,
		...rest
	}: Props & ComponentProps<typeof SimpleTextField> = $props()

	let localError = $derived((valueRequired && value?.toString().length == 0) || error)

	const prependInner_render = $derived(prependInner)
	const appendInner_render = $derived(appendInner)
</script>

<SimpleTextField
	{placeholder}
	bind:value
	{type}
	{disabled}
	{readonly}
	{appendIcon}
	{appendInnerIcon}
	{...rest}
	class={clazz}
	--simple-textfield-height="40px"
	--simple-textfield-border={localError
		? '1px solid rgb(var(--global-color-error-600))'
		: undefined}
>
	{#snippet prependInnerSnippet()}
		{@render prependInner_render?.()}
	{/snippet}
	{#snippet appendInnerSnippet()}
		{#if appendInner_render}{@render appendInner_render()}{:else if !!appendInnerIcon}
			<Icon name={appendInnerIcon} />
		{/if}
	{/snippet}
</SimpleTextField>
