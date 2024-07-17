<script lang="ts">
	import { ROLES, type Role } from "$lib/services/scouts/scouts.service";
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"

  export let values: Role[] = [],
    multiple: boolean = false,
    roles: Role[] = ROLES,
    height: ComponentProps<StandardAutocomplete>['height'] = undefined

  let selectedValues: ComponentProps<StandardAutocomplete>['values'] = []
  $: selectedValues = values?.map(r => ({
    label: r,
    value: r
  }))

  function handleChange() {
    values = selectedValues?.map((sv) => sv.value) as Role[]
  }
</script>

<StandardAutocomplete
  items={roles.map((v) => {
    return {
      value: v,
      label: v
    }
  })}
  bind:values={selectedValues}
  on:change={handleChange}
  on:change
  bind:multiple
  {height}
></StandardAutocomplete>