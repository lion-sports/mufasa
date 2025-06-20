<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Place } from '@/lib/services/places/places.service'

  type ItemData = {
    place: Place
  }

  type Props = {
    places?: Place[]
		values?: Place[]
  } & Omit<ComponentProps<typeof StandardAutocomplete<ItemData>>, 'values'>

  let {
    places = [],
		values = $bindable([]),
    placeholder = 'Places',
		...rest
  }: Props = $props()

	let items: ComponentProps<typeof StandardAutocomplete<ItemData>>['items'] = $derived(places.map((place) => {
      return {
        label: place.name,
        value: place.id.toString(),
        data: {
          place: place
        }
      }
    })),
		selectedValues: ComponentProps<typeof StandardAutocomplete<ItemData>>['values'] = $derived(values.map((place) => {
      return {
        label: place.name,
        value: place.id.toString(),
        data: {
          place: place
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
		values = e.detail.selection.map((s) => s.data?.place!)
	}
</script>

<StandardAutocomplete
  {items}
  {placeholder}
	bind:values={selectedValues}
	onchange={handleSelectionChange}
  {...rest}
></StandardAutocomplete>
