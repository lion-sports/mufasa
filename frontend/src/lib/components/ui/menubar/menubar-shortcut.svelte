<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import { cn } from '$lib/utils.js'

	type $$Props = HTMLAttributes<HTMLSpanElement>

	interface Props {
		class?: $$Props['class']
		children?: import('svelte').Snippet
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props()
</script>

<span class={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...rest}>
	{@render children?.()}
</span>
