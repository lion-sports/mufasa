<script lang="ts">
	import { FilterBuilder, PaginatedTable } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
	import ShirtsService, { type Shirt } from '$lib/services/shirts/shirts.service'
  
	export let filters: ComponentProps<PaginatedTable>['filters'] = [
			{
        type: 'number',
        column: 'number',
        mode: 'equal',
				name: 'number',
				label: 'Nome'
			}
		],
		headers: ComponentProps<PaginatedTable>['headers'] = [
      {
				value: 'number',
				label: 'Number',
				type: { key: 'number' }
			},
			{
				value: 'name',
				label: 'Nome',
				type: { key: 'string' }
			}, {
				value: 'primaryColor',
				label: 'Colore Primario',
				type: { key: 'custom' }
			}, {
				value: 'secondaryColor',
				label: 'Colore Secondario',
				type: { key: 'custom' }
			}
		],
		shirts: Shirt[] = [],
    teammateId: number | undefined = undefined,
		filtersBuilder: FilterBuilder | undefined = undefined,
		page: number = 1,
		perPage: number = 100,
		maxPage: number = 0

	async function handleFilterChange(e: CustomEvent<{ builder: FilterBuilder }>) {
		filtersBuilder = e.detail.builder

		await fetchShirts()
	}

	async function handlePaginationChange(e: CustomEvent<{ page: number; rowsPerPage: number }>) {
		page = e.detail.page
    perPage = e.detail.rowsPerPage

		await fetchShirts()
	}

	async function fetchShirts() {
    let builder = filtersBuilder
    if(!builder) builder = new FilterBuilder()
    if(!!teammateId) builder.where('teammateId', teammateId)

		let service = new ShirtsService({ fetch })
		let paginatedShirts = await service.list({
			page,
			perPage,
			filtersBuilder: builder
		})

		page = paginatedShirts.meta.currentPage
		perPage = paginatedShirts.meta.perPage
		maxPage = paginatedShirts.meta.lastPage

		shirts = paginatedShirts.data
	}

	async function handleSortClick(e: CustomEvent) {
    let builder = filtersBuilder
    if(!builder) builder = new FilterBuilder()

    if(!!e.detail.sortedBy) {
      builder.orderBy(e.detail.sortedBy, e.detail.sortDirection)
      filtersBuilder = builder
      await fetchShirts()
    }
  }
</script>

<PaginatedTable
	bind:filters
	{headers}
	items={shirts}
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
    <slot name="filter-append"></slot>
	</div>
  <div slot="custom" let:header let:item>
    {#if header.value == 'primaryColor' || header.value == 'secondaryColor'}
      <div 
        class="h-[20px] w-[20px] min-h-[20px] min-w-[20px] rounded-full"
        style:background-color={item[header.value]}
      ></div>
    {/if}
  </div>
  <div slot="rowActions" let:item>
    <slot name="rowActions" {item}></slot>
  </div>
</PaginatedTable>
