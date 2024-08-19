<script lang="ts">
	import type { ScoutStudio } from "@/lib/services/scouts/scouts.service"
	import type { VolleyballScoutEventPosition } from "@/lib/services/scouts/volleyball"
	import TeammatesService from "@/lib/services/teammates/teammates.service"
  import PlayersService from "@/lib/services/players/players.service";

  export let studio: ScoutStudio

  let selectedPlayerFieldPosition: VolleyballScoutEventPosition | undefined = undefined
  $: if(!!studio.selectedPlayer && !!studio.scout.stash?.playersServePositions) {
    let positionToLoop: typeof studio.scout.stash.playersServePositions.friends 
      = studio.scout.stash.playersServePositions.friends

    if(studio.selectedPlayer.isOpponent)
      positionToLoop = studio.scout.stash.playersServePositions.enemy

    for(const [pos, v] of Object.entries(positionToLoop)) {
      if(v.player.id == studio.selectedPlayer.id) selectedPlayerFieldPosition = pos as any as VolleyballScoutEventPosition
    }
  }

  $: cardBackgroundClass = studio.selectedPlayer?.isOpponent ? 'bg-red-500/15' : 'bg-blue-500/15'
</script>

<div class="@container">
  <div class="text-2xl font-bold mb-2">
    {TeammatesService.getTeammateName({
      player: studio.selectedPlayer,
      teammate: studio.selectedPlayer?.teammate
    }) || 'Non specificato'}
  </div>
  <div class="grid gird-cols-1 @md:grid-cols-2 @2xl:grid-cols-12 gap-3">
    <div class="@2xl:col-span-3">
      <div class="w-full {cardBackgroundClass} p-2 rounded-sm transition-all">
        <div class="flex flex-col gap-2">
          <div class="flex justify-between gap-2">
            <div class="font-light">Numero di maglia</div>
            <div class="font-bold">{studio.selectedPlayer?.shirtNumber}</div>
          </div>
          <div class="flex justify-between gap-2">
            <div class="font-light">Ruolo</div>
            <div class="font-bold">{PlayersService.translateRole(studio.selectedPlayer?.role)}</div>
          </div>
          <div class="flex justify-between gap-2">
            <div class="font-light">Posizione</div>
            <div class="font-bold">{selectedPlayerFieldPosition || 'Non specificato'}</div>
          </div>
          <div class="flex justify-between gap-2">
            <div class="font-light">Squadra</div>
            <div class="font-bold">
              <div 
                class="py-1 px-2 rounded-md text-[.7rem] uppercase font-bold leading-[1.2rem]"
                class:bg-red-200={studio.selectedPlayer?.isOpponent}
                class:text-red-800={studio.selectedPlayer?.isOpponent}
                class:bg-blue-200={!studio.selectedPlayer?.isOpponent}
                class:text-blue-800={!studio.selectedPlayer?.isOpponent}
              >
                {#if studio.selectedPlayer?.isOpponent}
                  Avversario
                {:else}
                  Amico
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="@2xl:col-span-6">
      <div class="w-full {cardBackgroundClass} p-2 rounded-sm transition-all">pippo</div>
    </div>
    <div class="@2xl:col-span-3">
      <div class="w-full {cardBackgroundClass} p-2 rounded-sm transition-all">pippo</div>
    </div>
  </div>
</div>