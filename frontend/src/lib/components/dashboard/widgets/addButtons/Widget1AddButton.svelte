<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	interface Props {
		label?: import('svelte').Snippet
	}

	let { label }: Props = $props()
</script>

<div class="flex flex-col gap-2">
	<Icon name="mdi-test-tube" --icon-size="30px" />
	{@render label?.()}
	<div class="text-sm font-light">Placeholder widget to fill the grid.</div>
</div>
