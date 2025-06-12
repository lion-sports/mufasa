<script lang="ts">
	import { PaginatedTable, SimpleTable } from '@likable-hair/svelte'
	import { onMount, type ComponentProps } from 'svelte'
	import type { Scout } from '$lib/services/scouts/scouts.service'

	interface Props {
		headers?: ComponentProps<typeof SimpleTable>['headers']
		scouts?: Scout[]
		custom?: import('svelte').Snippet<[any]>
		rowActions?: import('svelte').Snippet<[any]>
		onrowClick?: ComponentProps<typeof SimpleTable>['onrowClick']
	}

	let {
		headers = [
			{
				label: 'Nome',
				type: { key: 'string' },
				value: 'name',
				sortable: true
			},
			{
				label: 'Sport',
				type: { key: 'string' },
				value: 'sport',
				sortable: true
			}
		],
		scouts = [],
		custom,
		rowActions,
		onrowClick
	}: Props = $props()

	const custom_render = $derived(custom)
	const rowActions_render = $derived(rowActions)
</script>

<SimpleTable {headers} items={scouts} {onrowClick}>
	{#snippet customSnippet({ header, item })}
		<div>
			{@render custom_render?.({ header, item })}
		</div>
	{/snippet}
	{#snippet rowActionsSnippet({ item })}
		<div>
			{@render rowActions_render?.({ item })}
		</div>
	{/snippet}
</SimpleTable>
