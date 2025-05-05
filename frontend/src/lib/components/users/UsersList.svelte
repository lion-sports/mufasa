<script lang="ts">
	import type { User } from '$lib/services/auth/auth.service'
	import { SimpleTable } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	interface Props {
		users?: User[];
		rowActions?: import('svelte').Snippet<[any]>;
	}

	let { users = [], rowActions }: Props = $props();

	let headers: ComponentProps<SimpleTable>['headers'] = [
		{
			value: 'name',
			label: 'Nome',
			type: {
				key: 'string'
			}
		},
		{
			value: 'email',
			label: 'Email',
			type: {
				key: 'string'
			}
		}
	]

	const rowActions_render = $derived(rowActions);
</script>

<div style:max-width="100%" style:overflow="auto">
	<SimpleTable {headers} items={users}>
		{#snippet rowActions({ item })}
				<div style:display="flex" style:justify-content="end"  >
				{@render rowActions_render?.({ item, })}
			</div>
			{/snippet}
	</SimpleTable>
</div>
