<script lang="ts" context="module">
	export type Header = {
		value: string
		label: string
		type: 'boolean' | 'string' | 'number' | 'date' | 'custom'
		width?: string
		minWidth?: string
		data?: {
			[key: string]: any
		}
	}
</script>

<script lang="ts">
	export let headers: Header[] = [],
		items: { [key: string]: any }[] = [],
		width: string = 'auto'

	import { SimpleTable } from '@likable-hair/svelte'
</script>

<SimpleTable {headers} {items} {width} headerBorderRadius="5px">
	<svelte:fragment slot="appendLastColumn" let:item>
		<slot name="appendLastColumn" {item} />
	</svelte:fragment>

	<svelte:fragment slot="customColumn" let:item let:header>
		<slot name="customColumn" {item} {header} />
	</svelte:fragment>
</SimpleTable>
