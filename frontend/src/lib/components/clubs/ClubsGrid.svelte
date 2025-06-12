<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import ClubsCard from "./ClubsCard.svelte"

  type Props = {
    clubs: Club[],
    onclick: (params: {
      club: Club
    }) => void
  }

  let {
    clubs,
    onclick
  }: Props = $props()
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {#each clubs as club}
    <button class="text-left" onclick={() => {
      if(!!onclick) onclick({ club })}
    }>
      <ClubsCard {club}></ClubsCard>
    </button>
  {/each}
</div>