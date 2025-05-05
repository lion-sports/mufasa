<script lang="ts">
	import { FileInputList } from '@likable-hair/svelte'

	interface Props {
		files?: File[];
	}

	let { files = $bindable([]) }: Props = $props();
</script>

<FileInputList bind:files />
