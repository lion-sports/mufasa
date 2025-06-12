<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Group } from '@/lib/services/groups/groups.service'

  type ItemData = {
    group: Group
  }

  type Props = {
    groups?: Group[]
		values?: Group[]
  } & Omit<ComponentProps<typeof StandardAutocomplete<ItemData>>, 'values'>

  let {
    groups = [],
		values = $bindable([]),
    placeholder = 'Gruppo',
		...rest
  }: Props = $props()

	let items: ComponentProps<typeof StandardAutocomplete<ItemData>>['items'] = $derived(groups.map((group) => {
      return {
        label: group.name,
        value: group.id.toString(),
        data: {
          group: group
        }
      }
    })),
		selectedValues: ComponentProps<typeof StandardAutocomplete<ItemData>>['values'] = $derived(values.map((group) => {
      return {
        label: group.name,
        value: group.id.toString(),
        data: {
          group: group
        }
      }
    }))

	function handleSelectionChange(
		e: {
      detail: {
        selection: NonNullable<ComponentProps<typeof StandardAutocomplete<ItemData>>['values']>
      }
    }
	) {
		values = e.detail.selection.map((s) => s.data?.group!)
	}
</script>

<StandardAutocomplete
  {items}
  {placeholder}
	bind:values={selectedValues}
	onchange={handleSelectionChange}
  {...rest}
></StandardAutocomplete>
