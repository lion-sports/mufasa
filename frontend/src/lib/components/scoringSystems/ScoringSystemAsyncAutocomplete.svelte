<script lang="ts">
	import StandardAsyncAutocomplete from '../common/StandardAsyncAutocomplete.svelte'
	import type { Item } from '../common/StandardAutocomplete.svelte'
  import ScoringSystemsService, { type ScoringSystem } from '$lib/services/scoringSystems/scoringSystems.service';
	import { FilterBuilder } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
	import StandardAutocomplete from '../common/StandardAutocomplete.svelte'

	interface Props {
		values?: Item[];
		scoringSystems?: ScoringSystem[];
		multiple?: boolean;
		disabled?: boolean;
    onchange?: ComponentProps<typeof StandardAutocomplete>['onchange']
	}

	let {
		values = $bindable([]),
		scoringSystems = [],
		multiple = $bindable(false),
		disabled = $bindable(false),
    onchange
	}: Props = $props();

	async function searchCustomer(params: { searchText: string }): Promise<Item[]> {
		let service = new ScoringSystemsService({ fetch })
    let filtersBuilder = new FilterBuilder()
    filtersBuilder.where('scoring_systems.name', 'ILIKE', `%${params.searchText}%`)
		let results = await service.list({ filtersBuilder, page: 1, perPage: 200 })

		return results.data.map((v) => {
			return {
				label: v.name,
				value: v.id.toString(),
				data: {
					scoringSystem: v
				}
			}
		})
	}
</script>

<StandardAsyncAutocomplete
	searcher={searchCustomer}
	bind:values
  items={scoringSystems.map((ss) => ({
    label: ss.name,
    value: ss.id.toString(),
    data: {
      scoringSystem: ss
    }
  }))}
	bind:multiple
  bind:disabled
	{onchange}
	placeholder="Continua a scrivere ..."
/>
