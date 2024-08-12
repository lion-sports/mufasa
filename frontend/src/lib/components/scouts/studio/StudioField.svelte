<script lang="ts">
	import type { Scout, ScoutEventPlayer } from '@/lib/services/scouts/scouts.service'
	import type {
		VolleyballPlayersPosition,
		VolleyballScoutEventAnchor,
		VolleyballScoutEventPosition
	} from '@/lib/services/scouts/volleyball'
	import PositionMarker from '../PositionMarker.svelte'
	import TeammatesService from '@/lib/services/teammates/teammates.service'
	import PlayerMarker from '../PlayerMarker.svelte'
	import PlayerAnchorPosition from '../PlayerAnchorPosition.svelte'

	export let scout: Scout,
		phase: 'serve' | 'receive' | 'defenseBreak' | 'defenseSideOut' = 'serve'

	let positionPhaseKeyMapper = {
		serve: 'playersServePositions',
		defenseSideOut: 'playersDefenseSideOutPositions',
		defenseBreak: 'playersDefenseBreakPositions'
	} as Record<typeof phase, keyof Scout['stash']>

	$: positions = scout.stash?.[positionPhaseKeyMapper[phase]] as
		| VolleyballPlayersPosition
		| undefined
	$: enemyPosition = positions?.enemy
	$: friendsPosition = positions?.friends

  type ReceivePositions = {
    player: ScoutEventPlayer,
    position: VolleyballScoutEventPosition,
    anchor?: VolleyballScoutEventAnchor
  }[]
  let enemyReceivePositions: ReceivePositions = [] 
	$: if(!!scout.stash?.playersReceivePositions?.enemy) {
    enemyReceivePositions = []
    for(const [playerId, value] of Object.entries(scout.stash?.playersReceivePositions?.enemy)) {
      let player = scout.players.find((p) => Number(p.id) === Number(playerId))
      if(!player) continue

      enemyReceivePositions = [
        ...enemyReceivePositions,
        {
          player: player as ScoutEventPlayer,
          position: value.position,
          anchor: value.anchor
        }
      ]
    }
  } else enemyReceivePositions = []

	let leftPositionsNumbers: VolleyballScoutEventPosition[] = [5, 4, 6, 3, 1, 2]
	let rightPositionsNumbers: VolleyballScoutEventPosition[] = [2, 1, 3, 6, 4, 5]
</script>

<div class="bg-blue-400 w-full h-full flex justify-center items-center">
	<div class="bg-orange-400 w-[70%] max-w-[700px] h-[70%] min-h-[300px] border-slate-500 border-2 relative">
		<div
			class="absolute top-[-32px] bottom-[-32px] left-[calc(50%-2px)] bg-slate-500 w-[4px] rounded-full"
		></div>
		<div class="absolute top-0 bottom-0 left-[calc(33.33%-1px)] bg-slate-500 w-[2px]"></div>
		<div class="absolute top-0 bottom-0 left-[calc(66.66%-1px)] bg-slate-500 w-[2px]"></div>

		<div class="w-full grid grid-cols-2 h-full">
			<div class="grid grid-cols-2 h-full z-10">
				{#each leftPositionsNumbers as position}
					{#if phase !== 'receive'}
						<div class="flex justify-center items-center">
							<PlayerMarker friend>
								{friendsPosition?.[position]?.player.shirtNumber}
								<svelte:fragment slot="tooltip">
									{TeammatesService.getTeammateName({
										player: friendsPosition?.[position]?.player,
										teammate: friendsPosition?.[position]?.player.teammate
									})}
								</svelte:fragment>
							</PlayerMarker>
						</div>
					{/if}
				{/each}
			</div>
			{#if phase !== 'serve'}
				<div class="grid grid-cols-2 h-full z-10">
					{#each rightPositionsNumbers as position}
						<div class="flex justify-center items-center">
							<PlayerMarker opponent>
								{enemyPosition?.[position]?.player.shirtNumber}
								<svelte:fragment slot="tooltip">
									{TeammatesService.getTeammateName({
										player: enemyPosition?.[position]?.player,
										teammate: enemyPosition?.[position]?.player.teammate
									})}
								</svelte:fragment>
							</PlayerMarker>
						</div>
					{/each}
				</div>
      {:else}
        <div class="absolute top-0 bottom-0 right-0 left-[50%]">
          <div class="relative w-full h-full">
            {#each enemyReceivePositions as positionSpec}
              <div 
                class="absolute w-[50%] h-[33%] p-[2px]"
                style:right={[1, 6, 5].includes(Number(positionSpec.position)) ? '0%' : undefined}
                style:left={[2, 3, 4].includes(Number(positionSpec.position)) ? '0%' : undefined}
                style:top={
                  [2, 1].includes(Number(positionSpec.position)) ? '0%' : 
                  [3, 6].includes(Number(positionSpec.position)) ? '33%' :
                  undefined
                }
                style:bottom={
                  [4, 5].includes(Number(positionSpec.position)) ? '0%' :
                  undefined
                }
              >
                <PlayerAnchorPosition
                  direction="rightToLeft"
                  anchor={positionSpec.anchor}
                  class="z-20"
                >
                  <PlayerMarker opponent>
                    {positionSpec.player.shirtNumber}
                    <svelte:fragment slot="tooltip">
                      {TeammatesService.getTeammateName({
                        player: positionSpec.player,
                        teammate: positionSpec.player.teammate
                      })}
                    </svelte:fragment>
                  </PlayerMarker>
                </PlayerAnchorPosition>
              </div>
            {/each}
          </div>
        </div>
			{/if}
		</div>
	</div>
</div>

<style>
	.field {
	}
</style>
