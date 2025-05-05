<script lang="ts">
	import { Checkbox } from '@likable-hair/svelte'
	interface Props {
		value?: boolean;
		disabled?: boolean;
		id: string;
	}

	let { value = $bindable(false), disabled = false, id }: Props = $props();
</script>

<Checkbox bind:value {id} {disabled} on:change />
