<script lang="ts">
  import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
	import ClubsGrid from '@/lib/components/clubs/ClubsGrid.svelte'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props();
</script>

<PageTitle title="Clubs">
  {#snippet append()}
    <StandardButton href="/clubs/create">
      <span class="mr-2">
        <Icon name="mdi-plus"></Icon>
      </span>
      Nuovo
    </StandardButton>
  {/snippet}
</PageTitle>

{#if data.paginatedClubs.data.length == 0}
  <div class="flex justify-center items-center h-[400px]">
    <div class="font-light">
      Nessun club, <a class="underline text-[rgb(var(--global-color-primary-500))]" href="/clubs/create">creane uno</a>
    </div>
  </div>
{:else}
  <ClubsGrid
    clubs={data.paginatedClubs.data}
    onclick={(e) => {
      goto('/clubs/' + e.club.id)
    }}
  ></ClubsGrid>
{/if}