<script lang="ts">
  import PlacesGrid from '@/lib/components/places/PlacesGrid.svelte'
  import type { PageData } from './$types';
	import { goto } from '$app/navigation'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'

  let { data }: { data: PageData } = $props();
</script>

<div class="flex justify-end pr-2">
  <StandardButton href={`/clubs/${data.club.id}/places/create`}>
    <span class="mr-2">
      <Icon name="mdi-plus"></Icon>
    </span>
    Nuovo
  </StandardButton>
</div>

{#if data.paginatedPlaces.data.length == 0}
  <div class="flex justify-center items-center h-[400px]">
    <div class="font-light">
      Nessun campo o palestra, <a 
        class="underline text-[rgb(var(--global-color-primary-500))]" 
        href={`/clubs/${data.club.id}/places/create`}
      >creane uno</a>
    </div>
  </div>
{:else}
  <PlacesGrid
    places={data.paginatedPlaces.data}
    onclick={(e) => {
      goto(`/clubs/${data.club.id}/places/${e.place.id}/edit`)
    }}
  ></PlacesGrid>
{/if}