<script lang="ts">
  import GroupsList from '$lib/components/groups/GroupsList.svelte'
	import type { PageData } from './$types'
	import { invalidate } from '$app/navigation'

  export let data: PageData

	async function handleGroupDestroy() {
    await invalidate('teams:[teamId]')
	}
</script>

<GroupsList team={data.team} searchable={true} groups={data.team.groups} on:destroy={handleGroupDestroy} />