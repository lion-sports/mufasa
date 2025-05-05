<script lang="ts">
	import { SPORTS } from "$lib/services/scouts/scouts.service"
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"

  interface Props {
    values?: ComponentProps<typeof StandardAutocomplete>['values'];
    onchange?: ComponentProps<typeof StandardAutocomplete>['onchange'];
  }

  let { values = $bindable([]), onchange }: Props = $props();

</script>

<StandardAutocomplete
  items={SPORTS.map((v) => {
    return {
      value: v,
      label: v
    }
  })}
  bind:values={values}
  {onchange}
></StandardAutocomplete>