<script lang="ts">
  import { stopPropagation } from 'svelte/legacy';

  import type { PageData } from './$types';
  import ScoutSimpleTable from '$lib/components/scouts/ScoutSimpleTable.svelte';
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { goto, invalidate } from '$app/navigation'
	import ScoutsService from '@/lib/services/scouts/scouts.service'
  
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function handleRowClick(event: CustomEvent<any>) {
    goto(`/teams/${data.team.id}/events/${data.event.id}/scouts/${event.detail.item.id}/edit`) 
  }

  function handleStudioClick(params: { id: number }) {
    goto(`/teams/${data.team.id}/events/${data.event.id}/scouts/${params.id}/studio`) 
  }

  async function handleDeleteClick(params: { id: number }) {
    let confirmed = confirm('Sei sicuro di voler eliminare lo scout?')

    if(confirmed) {
      let scoutService = new ScoutsService({ fetch })
      await scoutService.destroy({ id: params.id })

      await invalidate('scouts:list')
    }
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
  {#snippet rowActions({ item })}
    <div class="px-2 flex gap-8"  >
      <button
        onclick={stopPropagation(() => handleStudioClick({ id: item.id }))}
      >
        <Icon
          name="mdi-atom-variant"
        ></Icon>
      </button>
      <button
        onclick={stopPropagation(() => handleDeleteClick({ id: item.id }))}
        class=" text-red-500"
      >
        <Icon
          name="mdi-delete"
        ></Icon>
      </button>
    </div>
  {/snippet}
</ScoutSimpleTable>