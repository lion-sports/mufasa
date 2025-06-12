<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	interface Props {
		label?: import('svelte').Snippet
	}

	let { label }: Props = $props()
</script>

<div class="flex flex-col gap-2">
	<Icon name="mdi-chart-bar" --icon-size="30px" />
	{@render label?.()}
	<div class="text-sm font-light">
		Volleyball block summary, with hands out, points, put backs, touches and relative percentage.
	</div>
</div>
