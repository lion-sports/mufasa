<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'

	interface Props {
		class?: {
			label?: string
			input?: {
				container?: string
				row?: string
				input?: string
			}
		}
		value?: string | number | undefined
		label?: string | undefined
		placeholder?: string
		name: string
		type?: 'password' | 'text' | 'number'
		readonly?: boolean
		error?: boolean
		disabled?: boolean
		appendInner?: import('svelte').Snippet
	}

	let {
		class: clazz = {},
		value = $bindable(undefined),
		label = undefined,
		placeholder = '',
		name,
		type = 'text',
		readonly = false,
		error = false,
		disabled = false,
		appendInner,
		...rest
	}: Props & ComponentProps<typeof StandardTextfield> = $props()

	const appendInner_render = $derived(appendInner)
</script>

{#if label}
	<label style:font-weight="500" style:margin-left="4px" for={name} class={clazz.label}
		>{label || ''}</label
	>
{/if}

<div style:margin-top="4px">
	<StandardTextfield
		bind:value
		{type}
		{readonly}
		{error}
		{disabled}
		{placeholder}
		{...rest}
		class={clazz.input}
    --simple-textfield-default-hint-color={error ? 'rgb(var(--global-color-error-500))' : undefined}
	>
		{#snippet appendInner()}
			{@render appendInner_render?.()}
		{/snippet}
	</StandardTextfield>
</div>
