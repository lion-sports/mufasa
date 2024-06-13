<script lang="ts">
  import type { PageData } from './$types';
  import ScoutSimpleTable from '$lib/components/scouts/ScoutSimpleTable.svelte';
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'
  
  export let data: PageData;

  function handleRowClick(event: CustomEvent<any>) {
    goto(`/teams/${data.team.id}/events/${data.event.id}/scouts/${event.detail.item.id}/edit`) 
  }

  function handleStudioClick(params: { id: number }) {
    goto(`/teams/${data.team.id}/events/${data.event.id}/scouts/${params.id}/studio`) 
  }
</script>

<div class="flex justify-end mb-2">
  <StandardButton
    href={`/teams/${data.team.id}/events/${data.event.id}/scouts/create`}
  >
    <Icon name="mdi-plus"></Icon>
    Aggiungi scout
  </StandardButton>
</div>

<ScoutSimpleTable
  scouts={data.event.scouts}
  on:rowClick={handleRowClick}
>
  <div class="px-2" slot="rowActions" let:item>
    <button
      on:click|stopPropagation={() => handleStudioClick({ id: item.id })}
    >
      <Icon
        name="mdi-atom-variant"
      ></Icon>
    </button>
  </div>
</ScoutSimpleTable>