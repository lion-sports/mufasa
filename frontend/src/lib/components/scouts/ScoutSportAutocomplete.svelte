<script lang="ts">
	import { SPORTS } from "$lib/services/scouts/scouts.service"
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"

  export let values: ComponentProps<StandardAutocomplete>['values'] = []

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