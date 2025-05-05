<script lang="ts">
  import { run } from 'svelte/legacy';

	import { ROLES, type Role } from "$lib/services/scouts/scouts.service";
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "../common/StandardAutocomplete.svelte"

  interface Props {
    values?: Role[];
    multiple?: boolean;
    roles?: Role[];
    height?: ComponentProps<StandardAutocomplete>['height'];
  }

  let {
    values = $bindable([]),
    multiple = $bindable(false),
    roles = ROLES,
    height = undefined
  }: Props = $props();

  let selectedValues: ComponentProps<StandardAutocomplete>['values'] = $state([])
  run(() => {
    selectedValues = values?.map(r => ({
      label: r,
      value: r
    }))
  });

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