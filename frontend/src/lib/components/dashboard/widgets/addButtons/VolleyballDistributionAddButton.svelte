<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	interface Props {
		label?: import('svelte').Snippet;
	}

	let { label }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	<Icon name="mdi-human-male-board-poll" --icon-size="30px" />
	{@render label?.()}
	<div class="text-sm font-light">Volleyball setter distribution and infos about the spike efficiency.</div>
</div>
