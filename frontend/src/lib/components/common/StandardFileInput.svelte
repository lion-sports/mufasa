<script lang="ts">
	import { FileInputList } from '@likable-hair/svelte'

	export let files: File[] = [],
		height: string = '200px'
</script>

<FileInputList bind:files {height} />
