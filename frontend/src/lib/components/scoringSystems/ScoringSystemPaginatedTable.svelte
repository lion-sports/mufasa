<script lang="ts">
	import { FilterBuilder, PaginatedTable } from '@likable-hair/svelte'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import ScoringSystemsService, {
		type ScoringSystem
	} from '$lib/services/scoringSystems/scoringSystems.service'
	import type { ComponentProps } from 'svelte'
	import StandardCheckbox from '../common/StandardCheckbox.svelte'

	interface Props {
		filters?: ComponentProps<typeof PaginatedTable>['filters']
		headers?: ComponentProps<typeof PaginatedTable>['headers']
		onrowClick?: ComponentProps<typeof PaginatedTable>['onrowClick']
		scoringSystems?: ScoringSystem[]
		filtersBuilder?: FilterBuilder | undefined
		page?: number
		perPage?: number
		maxPage?: number
	}

	let {
		filters = $bindable([
			{
				type: 'string',
				column: 'name',
				mode: 'ilike',
				advanced: false,
				name: 'name',
				label: 'Nome'
			}
		]),
		headers = [
			{
				value: 'name',
				label: 'Nome',
				type: { key: 'string' }
			},
			{
				value: 'public',
				label: 'Pubblico',
				type: { key: 'custom' }
			}
		],
		scoringSystems = $bindable([]),
		filtersBuilder = $bindable(undefined),
		page = $bindable(1),
		perPage = $bindable(100),
		maxPage = $bindable(0),
		onrowClick
	}: Props = $props()

	async function handleFilterChange(e: { detail: { builder: FilterBuilder } }) {
		filtersBuilder = e.detail.builder

		await fetchScoringSystems()
	}

	async function handlePaginationChange(e: { detail: { page: number; rowsPerPage: number } }) {
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

	async function handleSortClick(e: {
		detail: {
			sortedBy?: string | undefined
			sortDirection: string
		}
	}) {
		let builder = new FilterBuilder()
		if (!!e.detail.sortedBy) {
			builder.orderBy(e.detail.sortedBy, e.detail.sortDirection as 'asc' | 'desc')
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
	{maxPage}
	searchBarVisible={false}
	onfiltersChange={handleFilterChange}
	onpaginationChange={handlePaginationChange}
	{onrowClick}
	onsort={(e) => handleSortClick(e)}
>
	{#snippet filterAppendSnippet()}
		<div class="ml-auto">
			<StandardButton style="primary" href="/profile/scoringSystems/create"
				>+ Aggiungi sistema di punteggio</StandardButton
			>
		</div>
	{/snippet}

	{#snippet customSnippet({ item, header })}
		<div>
			{#if header.value == 'public'}
				<StandardCheckbox disabled id={'public-' + item.id} value={item.public}></StandardCheckbox>
			{/if}
		</div>
	{/snippet}
</PaginatedTable>
