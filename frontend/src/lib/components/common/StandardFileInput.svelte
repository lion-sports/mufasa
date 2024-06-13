<script lang="ts">
	import { FileInputList } from '@likable-hair/svelte'

	export let files: File[] = []
</script>

<FileInputList bind:files />
