<script lang="ts">
  import type { ComponentProps } from 'svelte';
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'

	interface Props {
		class?: {
		label?: string
		input?: {
			container?: string
			row?: string
			input?: string
		}
	};
		value?: string | number | undefined;
		label?: string | undefined;
		placeholder?: string;
		name: string;
		type?: 'password' | 'text' | 'number';
		readonly?: boolean;
		error?: boolean;
		disabled?: boolean;
		appendInner?: import('svelte').Snippet;
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
  }: Props & ComponentProps<typeof StandardTextfield> = $props();

	const appendInner_render = $derived(appendInner);
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
		{...rest}
		class={clazz.input}
	>
		{#snippet appendInner()}
			
				{@render appendInner_render?.()}
			
			{/snippet}
	</StandardTextfield>
</div>
