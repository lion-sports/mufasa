<script lang="ts">
	import { SPORTS } from "$lib/services/scouts/scouts.service"
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"

  interface Props {
    values?: ComponentProps<StandardAutocomplete>['values'];
  }

  let { values = $bindable([]) }: Props = $props();

</script>

<StandardAutocomplete
  items={SPORTS.map((v) => {
    return {
      value: v,
      label: v
    }
  })}
  bind:values={values}
  on:change
></StandardAutocomplete>