<script lang="ts">
	import ClubsGroupsTable from '@/lib/components/clubs/ClubsGroupsTable.svelte'
	import type { PageData } from './$types'
	import { invalidate } from '$app/navigation'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'

	let { data }: { data: PageData } = $props()

	async function invalidatePage() {
		await invalidate('club:settings:groups')
	}
</script>

<div class="flex gap-2">
  <div class="text-3xl font-semibold grow">Gruppi</div>
  <div>
    <StandardButton
      href={`/clubs/${data.club.id}/settings/groups/create`}
    >
      <span class="mr-2">
        <Icon name="mdi-plus"></Icon>
      </span>
      Nuovo
    </StandardButton>
  </div>
</div>
<div class="mt-4">
	<ClubsGroupsTable 
    groups={data.paginatedGroups.data} 
    ondestroy={invalidatePage}
	>
    {#snippet rowActionsSnippet({ item })}
      <div class="flex gap-2 mr-2">
        <a href={`/clubs/${data.club.id}/settings/groups/${item.id}/edit`}>
          <Icon name="mdi-pencil"></Icon>
        </a>
      </div>
    {/snippet}
  </ClubsGroupsTable>
</div>
