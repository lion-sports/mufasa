<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'
	import type { Team } from '@/lib/services/teams/teams.service'

  type ItemData = {
    team: Team
  }

  type Props = {
    teams?: Team[]
		values?: Team[]
  } & Omit<ComponentProps<typeof StandardAutocomplete<ItemData>>, 'values'>

  let {
    teams = [],
		values = $bindable([]),
    placeholder = 'Teams',
		...rest
  }: Props = $props()

	let items: ComponentProps<typeof StandardAutocomplete<ItemData>>['items'] = $derived(teams.map((team) => {
      return {
        label: team.name,
        value: team.id.toString(),
        data: {
          team: team
        }
      }
    })),
		selectedValues: ComponentProps<typeof StandardAutocomplete<ItemData>>['values'] = $derived(values.map((team) => {
      return {
        label: team.name,
        value: team.id.toString(),
        data: {
          team: team
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
		values = e.detail.selection.map((s) => s.data?.team!)
	}
</script>

<StandardAutocomplete
  {items}
  {placeholder}
	bind:values={selectedValues}
	onchange={handleSelectionChange}
  {...rest}
></StandardAutocomplete>
