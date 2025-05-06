<script lang="ts">
	import { goto } from '$app/navigation'
	import ScoringSystemPaginatedTable from '$lib/components/scoringSystems/ScoringSystemPaginatedTable.svelte'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
</script>

<ScoringSystemPaginatedTable
	scoringSystems={data.paginatedScoringSystems.data}
	maxPage={data.paginatedScoringSystems.meta.lastPage}
	perPage={data.paginatedScoringSystems.meta.perPage}
	onrowClick={(e) => {
		goto('/profile/scoringSystems/' + e.detail.item.id + '/edit')
	}}
></ScoringSystemPaginatedTable>
