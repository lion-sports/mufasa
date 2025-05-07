<script lang="ts">
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"
  import { SPORTS } from 'lionn-common'

	interface Props {
		values?: ComponentProps<typeof StandardAutocomplete>['values']
		onchange?: ComponentProps<typeof StandardAutocomplete>['onchange']
	}

	let { values = $bindable([]), onchange }: Props = $props()
</script>

<StandardAutocomplete
	items={SPORTS.map((v) => {
		return {
			value: v,
			label: v
		}
	})}
	bind:values
	{onchange}
></StandardAutocomplete>
