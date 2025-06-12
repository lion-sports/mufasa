<script lang="ts">
	import { Checkbox } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		value?: boolean
		disabled?: boolean
		id: string
		onchange?: ComponentProps<typeof Checkbox>['onchange']
	}

	let { value = $bindable(), disabled = false, id, onchange }: Props = $props()
</script>

<Checkbox bind:value {id} {disabled} {onchange} />
