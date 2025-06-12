<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Club } from '@/lib/services/clubs/clubs.service'

  type ItemData = {
    club: Club
  }

  type Props = {
    clubs?: Club[]
		values?: Club[]
  } & Omit<ComponentProps<typeof StandardAutocomplete<ItemData>>, 'values'>

  let {
    clubs = [],
		values = $bindable([]),
    placeholder = 'Clubs',
		...rest
  }: Props = $props()

	let items: ComponentProps<typeof StandardAutocomplete<ItemData>>['items'] = $derived(clubs.map((club) => {
      return {
        label: club.name,
        value: club.id.toString(),
        data: {
          club: club
        }
      }
    })),
		selectedValues: ComponentProps<typeof StandardAutocomplete<ItemData>>['values'] = $derived(values.map((club) => {
      return {
        label: club.name,
        value: club.id.toString(),
        data: {
          club: club
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
		values = e.detail.selection.map((s) => s.data?.club!)
	}
</script>

<StandardAutocomplete
  {items}
  {placeholder}
	bind:values={selectedValues}
	onchange={handleSelectionChange}
  {...rest}
></StandardAutocomplete>
