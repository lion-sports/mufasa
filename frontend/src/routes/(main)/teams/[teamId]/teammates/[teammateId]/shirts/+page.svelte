<script lang="ts">
  import StandardButton from '$lib/components/common/StandardButton.svelte'
  import ShirtsPaginatedTable from '$lib/components/shirts/ShirtsPaginatedTable.svelte'
	import { CircularLoader, Icon } from '@likable-hair/svelte'
  import type { PageData } from './$types';
	import { goto, invalidate } from '$app/navigation'
	import ShirtService from '$lib/services/shirts/shirts.service'
  
  export let data: PageData;

  let loadingDestroyId: number | undefined = undefined

  function handleRowClick(e: CustomEvent) {
    goto(`/teams/${data.team.id}/teammates/${data.teammate.id}/shirts/${e.detail.item.id}/edit`)
  }

  async function handleShirtDelete(shirt: any ) {
    let confirmed = confirm('Vuoi davvero eliminare la divisa?')

    if(confirmed) {
      loadingDestroyId = shirt.id
      let service = new ShirtService({ fetch })
      await service.destroy({ id: shirt.id })
      await invalidate('shirts:list')
      loadingDestroyId = undefined
    }
  }
</script>

<ShirtsPaginatedTable
  shirts={data.paginatedShirts.data}
  maxPage={data.paginatedShirts.meta.lastPage}
  page={data.paginatedShirts.meta.currentPage}
  on:rowClick={handleRowClick}
>
  <svelte:fragment slot="rowActions" let:item>
    <button
      on:click|stopPropagation={() => handleShirtDelete(item)}
    >
      {#if loadingDestroyId == item.id}
        <CircularLoader></CircularLoader>
      {:else}
        <Icon name="mdi-delete" --icon-color="rgb(var(--global-color-error-500))"></Icon>
      {/if}
    </button>
  </svelte:fragment>
  <svelte:fragment slot="filter-append">
    <StandardButton
      href={`/teams/${data.team.id}/teammates/${data.teammate.id}/shirts/new`}
    >
      <Icon name="mdi-plus"></Icon>
      Aggiungi maglia
    </StandardButton>
  </svelte:fragment>
</ShirtsPaginatedTable>