<script lang="ts">
	import type { Place } from "@/lib/services/places/places.service"
	import PlacesCard from "./PlaceCard.svelte"

  type Props = {
    places: Place[],
    onclick: (params: {
      place: Place
    }) => void
  }

  let {
    places,
    onclick
  }: Props = $props()
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {#each places as place}
    <button class="text-left" onclick={() => {
      if(!!onclick) onclick({ place })}
    }>
      <PlacesCard {place}></PlacesCard>
    </button>
  {/each}
</div>