<script lang="ts">
	import { Switch } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		value: boolean
		onchange?: ComponentProps<typeof Switch>['onchange']
	}

	let { value = $bindable(), onchange }: Props = $props()
</script>

<Switch bind:value {onchange} />
