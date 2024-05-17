<script lang="ts">
	import { PaginatedTable, SimpleTable } from '@likable-hair/svelte'
	import { onMount, type ComponentProps } from 'svelte'
  import type { Scout } from '$lib/services/scouts/scouts.service';

	export let headers: ComponentProps<SimpleTable>['headers'] = [
			{
				label: 'Nome',
				type: { key: 'string' },
				value: 'name',
				sortable: true,
			},
			{
				label: 'Sport',
				type: { key: 'string' },
				value: 'sport',
				sortable: true,
			}
		],
		scouts: Scout[] = []
</script>

<SimpleTable {headers} items={scouts} on:rowClick>
	<div slot="custom" let:header let:item>
    <slot name="custom" {header} {item}></slot>
	</div>
</SimpleTable>
