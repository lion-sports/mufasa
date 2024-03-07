<script lang="ts">
	import type { User } from '$lib/services/auth/auth.service'
	import { SimpleTable } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	export let users: User[] = []

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
</script>

<div style:max-width="100%" style:overflow="auto">
	<SimpleTable {headers} items={users}>
		<div style:display="flex" style:justify-content="end" slot="rowActions" let:item>
			<slot name="rowActions" {item} />
		</div>
	</SimpleTable>
</div>
