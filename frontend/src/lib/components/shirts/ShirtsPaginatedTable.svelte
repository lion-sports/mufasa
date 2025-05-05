<script lang="ts">
	import { FilterBuilder, PaginatedTable } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
	import ShirtsService, { type Shirt } from '$lib/services/shirts/shirts.service'
  
	interface Props {
		filters?: ComponentProps<typeof PaginatedTable>['filters'];
		headers?: ComponentProps<typeof PaginatedTable>['headers'];
		shirts?: Shirt[];
		teammateId?: number | undefined;
		filtersBuilder?: FilterBuilder | undefined;
		page?: number;
		perPage?: number;
		maxPage?: number;
		filterAppend?: import('svelte').Snippet
		rowActions?: import('svelte').Snippet<[any]>
    onrowClick?: ComponentProps<typeof PaginatedTable>['onrowClick']
	}

	let {
		filters = $bindable([
			{
        type: 'number',
        column: 'number',
        mode: 'equal',
				name: 'number',
				label: 'Nome'
			}
		]),
		headers = [
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
		shirts = $bindable([]),
		teammateId = undefined,
		filtersBuilder = $bindable(undefined),
		page = $bindable(1),
		perPage = $bindable(100),
		maxPage = $bindable(0),
		filterAppend,
		rowActions,
    onrowClick
	}: Props = $props();

	async function handleFilterChange(e: {detail: { builder: FilterBuilder }}) {
		filtersBuilder = e.detail.builder

		await fetchShirts()
	}

	async function handlePaginationChange(e: {detail: { page: number; rowsPerPage: number }}) {
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

	async function handleSortClick(e: {
    detail: {
      sortedBy?: string | undefined
			sortDirection: string
    }
  }) {
    let builder = filtersBuilder
    if(!builder) builder = new FilterBuilder()

    if(!!e.detail.sortedBy) {
      builder.orderBy(e.detail.sortedBy, e.detail.sortDirection as 'asc' | 'desc')
      filtersBuilder = builder
      await fetchShirts()
    }
  }

	const filterAppend_render = $derived(filterAppend);
	const rowActions_render = $derived(rowActions);
</script>

<PaginatedTable
	bind:filters
	{headers}
	items={shirts}
	bind:page
	bind:rowsPerPage={perPage}
	{maxPage}
	searchBarVisible={false}
	onfiltersChange={handleFilterChange}
	onpaginationChange={handlePaginationChange}
	{onrowClick}
	onsort={(e) => handleSortClick(e)}
>
	{#snippet filterAppendSnippet()}
		<div class="ml-auto" >
	    {@render filterAppend_render?.()}
		</div>
	{/snippet}
  {#snippet customSnippet({ header, item })}
		<div   >
	    {#if header.value == 'primaryColor' || header.value == 'secondaryColor'}
	      <div 
	        class="h-[20px] w-[20px] min-h-[20px] min-w-[20px] rounded-full"
	        style:background-color={item[header.value]}
	      ></div>
	    {/if}
	  </div>
	{/snippet}
  {#snippet rowActionsSnippet({ item })}
		<div  >
	    {@render rowActions_render?.({ item, })}
	  </div>
	{/snippet}
</PaginatedTable>
