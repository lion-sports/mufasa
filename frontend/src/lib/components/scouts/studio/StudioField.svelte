<script lang="ts">
	import type { Scout } from "@/lib/services/scouts/scouts.service"
	import type { VolleyballPlayersPosition, VolleyballScoutEventPosition } from "@/lib/services/scouts/volleyball"
	import PositionMarker from "../PositionMarker.svelte"

  export let scout: Scout,
    phase: 'serve' | 'receive' | 'defenseBreak' | 'defenseSideOut' = 'serve'

  let positionPhaseKeyMapper = {
    'serve': 'playersServePositions',
    'defenseSideOut': 'playersDefenseSideOutPositions',
    'defenseBreak': 'playersDefenseBreakPositions'
  } as Record<typeof phase, keyof Scout['stash']>

  $: positions = scout.stash?.[positionPhaseKeyMapper[phase]] as VolleyballPlayersPosition | undefined
  $: enemyPosition = positions?.enemy
  $: friendsPosition = positions?.friends

  let leftPositionsNumbers: VolleyballScoutEventPosition[] = [5, 4, 6, 3, 1, 2]
  let rightPositionsNumbers: VolleyballScoutEventPosition[] = [2, 1, 3, 6, 4, 5]
</script>

<div class="bg-blue-400 w-full h-[500px] flex justify-center items-center">
  <div class="bg-orange-400 w-[600px] h-[300px] border-slate-500 border-2 relative">
    <div class="absolute top-[-32px] bottom-[-32px] left-[calc(50%-2px)] bg-slate-500 w-[4px] rounded-full"></div>
    <div class="absolute top-0 bottom-0 left-[calc(33.33%-1px)] bg-slate-500 w-[2px]"></div>
    <div class="absolute top-0 bottom-0 left-[calc(66.66%-1px)] bg-slate-500 w-[2px]"></div>

    
    <div class="w-full grid grid-cols-2 h-full">
      <div class="grid grid-cols-2 h-full z-10">
        {#each leftPositionsNumbers as position}
          <div class="flex justify-center items-center">
            <PositionMarker friend>
              {position}
            </PositionMarker>
          </div>
        {/each}
      </div>
      <div class="grid grid-cols-2 h-full z-10">
        {#each rightPositionsNumbers as position}
          <div class="flex justify-center items-center">
            <PositionMarker opponent>
              {position}
            </PositionMarker>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>


<style>
  .field {

  }
</style>