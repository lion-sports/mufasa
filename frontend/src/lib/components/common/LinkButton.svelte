<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		marginTop?: number;
		fontSize?: string | undefined;
		disabled?: boolean;
		href: string;
		children?: import('svelte').Snippet;
	}

	let {
		marginTop = 5,
		fontSize = undefined,
		disabled = false,
		href,
		children
	}: Props = $props();
</script>

<a
  {href}
	style:color="rgb(var(--gloabl-color-primary-500))"
	style:cursor="pointer"
	style:width="fit-content"
	style:margin-top={marginTop + 'px'}
	style:font-size={fontSize}
	style:pointer-events={disabled ? 'none' : 'initial'}
	onclick={bubble('click')}
	onkeypress={bubble('keypress')}
>
	{@render children?.()}
</a>
