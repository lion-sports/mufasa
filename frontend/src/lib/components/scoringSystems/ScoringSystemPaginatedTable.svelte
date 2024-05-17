<script lang="ts">
	import { FilterBuilder, PaginatedTable } from '@likable-hair/svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
  import ScoringSystemsService, { type ScoringSystem } from '$lib/services/scoringSystems/scoringSystems.service'
	import { DateTime } from 'luxon'
	import type { ComponentProps } from 'svelte'

	export let filters: ComponentProps<PaginatedTable>['filters'] = [
			{
				type: 'string',
				column: 'name',
				mode: 'ilike',
				advanced: false,
				name: 'name',
				label: 'Nome'
			}
		],
		headers: ComponentProps<PaginatedTable>['headers'] = [
			{
				value: 'description',
				label: 'Description',
				type: { key: 'number' }
			}
		],
		scoringSystems: ScoringSystem[] = [],
		filtersBuilder: FilterBuilder | undefined = undefined,
		page: number = 1,
		perPage: number = 100,
		maxPage: number = 0

	async function handleFilterChange(e: CustomEvent<{ builder: FilterBuilder }>) {
		filtersBuilder = e.detail.builder

		await fetchScoringSystems()
	}

	async function handlePaginationChange(e: CustomEvent<{ page: number; rowsPerPage: number }>) {
		;(page = e.detail.page), (perPage = e.detail.rowsPerPage)

		await fetchScoringSystems()
	}

	async function fetchScoringSystems() {
		let service = new ScoringSystemsService({ fetch })
		let paginatedScoringSystems = await service.list({
			page,
			perPage,
			filtersBuilder: filtersBuilder
		})

		page = paginatedScoringSystems.meta.currentPage
		perPage = paginatedScoringSystems.meta.perPage
		maxPage = paginatedScoringSystems.meta.lastPage

		scoringSystems = paginatedScoringSystems.data
	}

	async function handleSortClick(e: CustomEvent) {
    let builder = new FilterBuilder()
    if(!!e.detail.sortedBy) {
      builder.orderBy(e.detail.sortedBy, e.detail.sortDirection)
      filtersBuilder = builder
      await fetchScoringSystems()
    }
  }
</script>

<PaginatedTable
	bind:filters
	{headers}
	items={scoringSystems}
	bind:page
	bind:rowsPerPage={perPage}
	bind:maxPage
	searchBarVisible={false}
	on:filtersChange={handleFilterChange}
	on:paginationChange={handlePaginationChange}
	on:rowClick
	on:sort={(e) => handleSortClick(e)}
>
	<div class="ml-auto" slot="filter-append">
		<StandardButton style="primary" href="/profile/scoringSystems/create"
			>+ Aggiungi sistema di punteggio</StandardButton
		>
	</div>

	<div slot="custom" let:item let:header>
		{#if header.value == 'updatedAt'}
			<span>
				{DateTime.fromISO(item.updatedAt).toLocaleString()}
			</span>
		{/if}
	</div>
</PaginatedTable>
