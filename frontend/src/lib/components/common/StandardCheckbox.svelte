<script lang="ts">
	import { Checkbox } from '@likable-hair/svelte'
	export let value: boolean = false,
		disabled: boolean = false,
		id: string
</script>

<Checkbox bind:value {id} backgroundColor="trasparent" {disabled} on:change />
