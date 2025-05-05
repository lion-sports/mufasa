<script lang="ts">
	import { Switch } from '@likable-hair/svelte'
	interface Props {
		value: boolean;
	}

	let { value = $bindable() }: Props = $props();
</script>

<Switch bind:value on:change />
