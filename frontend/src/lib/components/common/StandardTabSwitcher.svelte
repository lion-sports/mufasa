<script lang="ts" context="module">
	export type Tab = {
		name: string
		label: string
		icon?: string
	}
</script>

<script lang="ts">
	export let tabs: Tab[] = [],
		selected: string,
		marginTop: string | undefined = undefined,
		marginBottom: string | undefined = undefined

	import { TabSwitcher } from '@likable-hair/svelte'
</script>

<div style:margin-top={marginTop} style:margin-bottom={marginBottom}>
	<TabSwitcher {tabs} bind:selected on:tab-click>
		<svelte:fragment slot="append">
			<slot name="append" />
		</svelte:fragment>
	</TabSwitcher>
</div>
