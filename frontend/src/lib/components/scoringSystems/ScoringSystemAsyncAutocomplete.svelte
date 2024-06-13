<script lang="ts">
	import StandardAsyncAutocomplete from '../common/StandardAsyncAutocomplete.svelte'
	import type { Item } from '../common/StandardAutocomplete.svelte'
  import ScoringSystemsService, { type ScoringSystem } from '$lib/services/scoringSystems/scoringSystems.service';
	import { FilterBuilder } from '@likable-hair/svelte'

	export let values: Item[] = [],
    scoringSystems: ScoringSystem[] = [],
		multiple: boolean = false,
    disabled: boolean = false

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
	on:change
	placeholder="Continua a scrivere ..."
/>
