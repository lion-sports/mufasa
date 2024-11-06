<script lang="ts">
	import type { Scout } from '@/lib/services/scouts/scouts.service'
  import type { ScoutEventPlayer } from 'lionn-common'
	import type {
		VolleyballPhase,
		VolleyballPlayersPosition,
		VolleyballScoutEventAnchor,
		VolleyballScoutEventPosition
	} from '@/lib/services/scouts/volleyball'
	import TeammatesService from '@/lib/services/teammates/teammates.service'
	import PlayerMarker from '../PlayerMarker.svelte'
	import PlayerAnchorPosition from '../PlayerAnchorPosition.svelte'
	import { createEventDispatcher } from 'svelte'
	import PlayersService from '@/lib/services/players/players.service'

	let dispatch = createEventDispatcher<{
		playerClick: {
			player: ScoutEventPlayer
		}
	}>()

	export let scout: Scout,
		phase: VolleyballPhase = 'serve',
    selectedPlayer: ScoutEventPlayer | undefined = undefined,
    friendSides: 'right' | 'left' = 'left'

	let positionPhaseKeyMapper = {
		serve: 'playersServePositions',
		defenseSideOut: 'playersDefenseSideOutPositions',
		defenseBreak: 'playersDefenseBreakPositions'
	} as Record<typeof phase, keyof Scout['stash']>

	$: friendsTotalPositions = scout.stash?.[positionPhaseKeyMapper[phase]] as
		| VolleyballPlayersPosition
		| undefined
	$: friendsPosition = friendsTotalPositions?.friends

	$: enemyTotalPositions =
		phase == 'receive'
			? scout.stash?.playersServePositions
			: phase == 'defenseBreak'
				? scout.stash?.playersDefenseSideOutPositions
				: phase == 'defenseSideOut'
					? scout.stash?.playersDefenseBreakPositions
					: undefined
	$: enemyPosition = enemyTotalPositions?.enemy

	type ReceivePositions = {
		player: ScoutEventPlayer
		position: VolleyballScoutEventPosition
		anchor?: VolleyballScoutEventAnchor
	}[]
	let enemyReceivePositions: ReceivePositions = []
	$: if (!!scout.stash?.playersReceivePositions?.enemy) {
		enemyReceivePositions = []
		for (const [playerId, value] of Object.entries(scout.stash?.playersReceivePositions?.enemy)) {
			let player = scout.players.find((p) => Number(p.id) === Number(playerId))
			if (!player) continue

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

	let friendsReceivePositions: ReceivePositions = []
	$: if (!!scout.stash?.playersReceivePositions?.friends) {
		friendsReceivePositions = []
		for (const [playerId, value] of Object.entries(scout.stash?.playersReceivePositions?.friends)) {
			let player = scout.players.find((p) => Number(p.id) === Number(playerId))
			if (!player) continue

			friendsReceivePositions = [
				...friendsReceivePositions,
				{
					player: player as ScoutEventPlayer,
					position: value.position,
					anchor: value.anchor
				}
			]
		}
	} else friendsReceivePositions = []

	let leftPositionsNumbers: VolleyballScoutEventPosition[] = [5, 4, 6, 3, 1, 2]
	let rightPositionsNumbers: VolleyballScoutEventPosition[] = [2, 1, 3, 6, 4, 5]

	function handlePlayerClick(player: ScoutEventPlayer | undefined) {
		if (!!player) {
			dispatch('playerClick', {
				player
			})
		}
	}
</script>

<div class="bg-blue-400 w-full h-full flex justify-center items-center">
	<div
		class="bg-orange-400 w-[70%] max-w-[700px] min-w-[400px] h-[70%] min-h-[300px] max-h-[450px] border-slate-500 border-2 relative"
	>
		<div
			class="absolute top-[-32px] bottom-[-32px] left-[calc(50%-2px)] bg-slate-500 w-[4px] rounded-full"
		></div>
		<div class="absolute top-0 bottom-0 left-[calc(33.33%-1px)] bg-slate-500 w-[2px]"></div>
		<div class="absolute top-0 bottom-0 left-[calc(66.66%-1px)] bg-slate-500 w-[2px]"></div>

		<div class="w-full grid grid-cols-2 h-full">
			{#if (friendSides == 'left' && phase !== 'receive') || (friendSides == 'right' && phase !== 'serve')}
        {@const positions = friendSides == 'left' ? friendsPosition : enemyPosition}
				<div class="grid grid-cols-2 h-full z-10">
					{#each leftPositionsNumbers as position}
						<div class="flex justify-center items-center">
							{#if !!positions?.[position]?.player}
								<PlayerMarker
                  friend={!positions[position]?.player.isOpponent}
                  opponent={positions[position]?.player.isOpponent}
									class="z-[15]"
									libero={positions[position]?.player.role === 'libero'}
									on:click={() => handlePlayerClick(positions[position]?.player)}
                  selected={!!selectedPlayer && selectedPlayer?.id ===  positions[position]?.player.id}
								>
									{positions[position]?.player.shirtNumber}
									<svelte:fragment slot="tooltip">
                    <div class="font-bold">
                      {TeammatesService.getTeammateName({
                        player: positions?.[position]?.player,
                        teammate: positions?.[position]?.player.teammate
                      })}
                    </div>
                    <div class="font-light text-sm">{PlayersService.translateRole(positions?.[position]?.player.role)}</div>
									</svelte:fragment>
								</PlayerMarker>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
        {@const receivePositions = friendSides == 'left' ? friendsReceivePositions : enemyReceivePositions}
				<div class="w-[100%]">
					<div class="relative w-full h-full">
						{#each receivePositions as positionSpec}
							<div
								class="absolute w-[50%] h-[33%] p-[2px]"
								style:left={[1, 6, 5].includes(Number(positionSpec.position)) ? '0%' : undefined}
								style:right={[2, 3, 4].includes(Number(positionSpec.position)) ? '0%' : undefined}
								style:top={[5, 4].includes(Number(positionSpec.position))
									? '0%'
									: [3, 6].includes(Number(positionSpec.position))
										? '33%'
										: undefined}
								style:bottom={[1, 2].includes(Number(positionSpec.position)) ? '0%' : undefined}
							>
								<PlayerAnchorPosition
									direction="leftToRight"
									anchor={positionSpec.anchor}
									class="z-20"
								>
									<PlayerMarker
										friend={!positionSpec.player.isOpponent}
                    opponent={positionSpec.player.isOpponent}
										libero={positionSpec.player.role === 'libero'}
										on:click={() => handlePlayerClick(positionSpec?.player)}
                    selected={!!selectedPlayer && selectedPlayer?.id ===  positionSpec?.player.id}
									>
										{positionSpec.player.shirtNumber}
										<svelte:fragment slot="tooltip">
                      <div class="font-bold">
                        {TeammatesService.getTeammateName({
                          player: positionSpec.player,
                          teammate: positionSpec.player.teammate
                        })}
                      </div>
                      <div class="font-light text-sm">{PlayersService.translateRole(positionSpec.player.role)}</div>
										</svelte:fragment>
									</PlayerMarker>
								</PlayerAnchorPosition>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			{#if (friendSides == 'right' && phase !== 'receive') || (friendSides == 'left' && phase !== 'serve')}
        {@const positions = friendSides == 'left' ? enemyPosition : friendsPosition}
				<div class="grid grid-cols-2 h-full z-10">
					{#each rightPositionsNumbers as position}
						<div class="flex justify-center items-center">
							{#if !!positions?.[position]}
								<PlayerMarker
									opponent={positions[position]?.player.isOpponent}
                  friend={!positions[position]?.player.isOpponent}
									libero={positions[position]?.player.role === 'libero'}
									on:click={() => handlePlayerClick(positions[position]?.player)}
                  selected={!!selectedPlayer && selectedPlayer?.id ===  positions[position]?.player.id}
								>
									{positions[position]?.player.shirtNumber}
									<svelte:fragment slot="tooltip">
                    <div class="font-bold">
                      {TeammatesService.getTeammateName({
                        player: positions?.[position]?.player,
                        teammate: positions?.[position]?.player.teammate
                      })}
                    </div>
                    <div class="font-light text-sm">{PlayersService.translateRole(positions?.[position]?.player.role)}</div>
									</svelte:fragment>
								</PlayerMarker>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
        {@const receivePositions = friendSides == 'left' ? enemyReceivePositions : friendsReceivePositions}
				<div class="absolute top-0 bottom-0 right-0 left-[50%]">
					<div class="relative w-full h-full">
						{#each receivePositions as positionSpec}
							<div
								class="absolute w-[50%] h-[33%] p-[2px]"
								style:right={[1, 6, 5].includes(Number(positionSpec.position)) ? '0%' : undefined}
								style:left={[2, 3, 4].includes(Number(positionSpec.position)) ? '0%' : undefined}
								style:top={[2, 1].includes(Number(positionSpec.position))
									? '0%'
									: [3, 6].includes(Number(positionSpec.position))
										? '33%'
										: undefined}
								style:bottom={[4, 5].includes(Number(positionSpec.position)) ? '0%' : undefined}
							>
								<PlayerAnchorPosition
									direction="rightToLeft"
									anchor={positionSpec.anchor}
									class="z-20"
								>
									<PlayerMarker
										friend={!positionSpec.player.isOpponent}
                    opponent={positionSpec.player.isOpponent}
										libero={positionSpec.player.role === 'libero'}
										on:click={() => handlePlayerClick(positionSpec?.player)}
                    selected={!!selectedPlayer && selectedPlayer?.id ===  positionSpec?.player.id}
									>
										{positionSpec.player.shirtNumber}
										<svelte:fragment slot="tooltip">
                      <div class="font-bold">
                        {TeammatesService.getTeammateName({
                          player: positionSpec.player,
                          teammate: positionSpec.player.teammate
                        })}
                      </div>
                      <div class="font-light text-sm">{PlayersService.translateRole(positionSpec.player.role)}</div>
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
