import ScoutService, { type Scout, type ScoutEventPlayer, type ScoutStudio } from '$lib/services/scouts/scouts.service'
import type { BlockScoutEventResult, ReceiveScoutEventResult, RotationType, ServeScoutEventResult, SpikeScoutEventResult, VolleyballPhase, VolleyballPlayersPosition, VolleyballScoutEventJson, VolleyballScoutEventParameters, VolleyballScoutEventPosition } from '$lib/services/scouts/volleyball'
import { get, writable } from 'svelte/store'
import socketService from '$lib/services/common/socket.service';

const studio = writable<ScoutStudio | undefined>(undefined)
export default studio

export async function reload() {
  let currentStudio = get(studio)

  if(!currentStudio) return

  let service = new ScoutService({ fetch })
  let newStudio = await service.studio({ id: currentStudio.scout.id })
  studio.set(newStudio)
}

const handleStashReload = (data: {
  scout: Scout
}) => {
  studio.update(v => {
    if(!!v) {
      v.scout.stash = data.scout.stash
    }
    return v
  })
}

const handleLastEventReload = (data: {
  lastEventsForPlayers: Record<number, VolleyballScoutEventJson[]>
}) => {
  studio.update(v => {
    if (!!v && !!v?.lastEventsForPlayers) v.lastEventsForPlayers = {}

    if(!!v?.lastEventsForPlayers) {
      for(const [key, value] of Object.entries(data.lastEventsForPlayers)) {
        let playerId = key as any as number
        v.lastEventsForPlayers[playerId] = value
      }
    }

    return v
  })
}

studio.subscribe((value) => {
  if(!!value) {
    socketService.off(`teams:${value.scout.event.teamId}:scout:stashReload`, handleStashReload)
    socketService.on(`teams:${value.scout.event.teamId}:scout:stashReload`, handleStashReload)

    socketService.off(`teams:${value.scout.event.teamId}:scout:lastEventReload`, handleLastEventReload)
    socketService.on(`teams:${value.scout.event.teamId}:scout:lastEventReload`, handleLastEventReload)
  }

  return () => {
    if(!!value) {
      socketService.off(`teams:${value.scout.event.teamId}:scout:stashReload`, handleStashReload)
      socketService.off(`teams:${value.scout.event.teamId}:scout:lastEventReload`, handleLastEventReload)
    }
  }
})

export function selectPlayer(params: {
  player: ScoutEventPlayer
}) {
  studio.update(v => {
    if(!!v) {
      v.selectedPlayer = params.player
    }
    return v
  })
}

export async function undo() {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  socketService.io?.emit(`teams:${currentStudio.scout.event.teamId}:scout:undo`, {
    scoutId: currentStudio.scout.id
  })
}

export async function add(params: {
  event: VolleyballScoutEventParameters
}) {
  socketService.io?.emit(`teams:${params.event.teamId}:scout:add`, params.event)
}

export async function playerInPosition(params: {
  player: ScoutEventPlayer,
  position: VolleyballScoutEventPosition
}) {
  let currentStudio = get(studio)
  if(!currentStudio) throw new Error('cannot call without a studio')

  await add({
    event: {
      type: 'playerInPosition',
      playerId: params.player.id,
      playerIsOpponent: params.player.isOpponent,
      player: params.player,
      position: params.position,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })
}

export async function manualPhase(params: {
  phase: VolleyballPhase
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  await add({
    event: {
      type: 'manualPhase',
      phase: params.phase,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })
}

export async function teamRotation(params: {
  opponent: boolean,
  rotationType?: RotationType
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let fromPositions: VolleyballPlayersPosition | undefined = currentStudio.scout.stash?.playersServePositions
  if(!fromPositions) throw new Error('cannot rotate if position are not defined')

  await add({
    event: {
      type: 'teamRotation',
      fromPositions: fromPositions,
      rotationType: params.rotationType || 'forward',
      opponent: params.opponent,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })
}

export async function pointScored(params: {
  opponent: boolean,
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  await add({
    event: {
      type: 'pointScored',
      opponent: params.opponent,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })

  await autoRotation({
    phase: currentStudio.scout.stash?.phase,
    opponent: params.opponent
  })
}

export async function playerSubstitution(params: {
  playerOut: ScoutEventPlayer,
  playerIn: ScoutEventPlayer
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let playerIsOpponent = params.playerOut.isOpponent,
    playerId = params.playerOut.id,
    playerIdIn = params.playerIn.id

  let position = getPlayerPositions({
    playerPositions: currentStudio.scout.stash?.playersServePositions,
    player: params.playerOut
  })

  if(position === undefined) throw new Error('cannot locate position')

  await add({
    event: {
      type: 'playerSubstitution',
      player: params.playerOut,
      playerId,
      playerIsOpponent,
      playerIdIn,
      playerIn: params.playerIn,
      position,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })
}

export async function liberoSubstitution(params: {
  inOrOut: 'in' | 'out',
  player: ScoutEventPlayer,
  libero: ScoutEventPlayer
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let opponent = params.player.isOpponent,
    playerId = params.player.id,
    liberoId = params.libero.id

  let position = getPlayerPositions({
    playerPositions: currentStudio.scout.stash?.playersServePositions,
    player: params.inOrOut == 'in' ? params.player : params.libero
  })

  if (position === undefined) throw new Error('cannot locate position')

  await add({
    event: {
      type: 'liberoSubstitution',
      player: params.player,
      inOrOut: params.inOrOut,
      playerId,
      opponent,
      position,
      libero: params.libero,
      liberoId: liberoId,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })
}

export async function block(params: {
  player: ScoutEventPlayer,
  result: BlockScoutEventResult
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let position = getPlayerPositions({
    playerPositions: currentStudio.scout.stash?.playersServePositions,
    player: params.player
  })

  if (position === undefined) throw new Error('cannot locate position')
  
  await add({
    event: {
      type: 'block',
      player: params.player,
      playerId: params.player.id,
      result: params.result,
      position: position, 
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })

  if(params.result == 'handsOut') {
    autoPoint({
      opponent: !params.player.isOpponent
    })
  } else if (params.result == 'point') {
    autoPoint({
      opponent: params.player.isOpponent
    })
  }
}

export async function serve(params: {
  player: ScoutEventPlayer,
  result: ServeScoutEventResult
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  await add({
    event: {
      type: 'serve',
      player: params.player,
      playerId: params.player.id,
      result: params.result,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })

  if (params.result == 'error') {
    await autoPoint({
      opponent: !params.player.isOpponent
    })
  }
}

export async function spike(params: {
  player: ScoutEventPlayer,
  result: SpikeScoutEventResult
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let currentPahse = currentStudio.scout.stash?.phase || 'defenseBreak'

  let position = getPlayerPositions({
    playerPositions: currentPahse == 'defenseBreak' ? 
      currentStudio.scout.stash?.playersDefenseBreakPositions : 
      currentStudio.scout.stash?.playersDefenseSideOutPositions,
    player: params.player
  })

  if (position === undefined) throw new Error('cannot locate position')

  await add({
    event: {
      type: 'spike',
      player: params.player,
      playerId: params.player.id,
      result: params.result,
      position,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })
}

export async function receive(params: {
  player: ScoutEventPlayer,
  result: ReceiveScoutEventResult
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let position: VolleyballScoutEventPosition | undefined = undefined

  if (!!currentStudio.scout.stash?.playersReceivePositions) {
    let currentPosition = params.player.isOpponent ?
      currentStudio.scout.stash?.playersReceivePositions.enemy :
      currentStudio.scout.stash?.playersReceivePositions.friends

    if(!!currentPosition) {
      for (const [playerId, value] of Object.entries(currentPosition)) {
        if (Number(playerId) == Number(params.player.id)) position = value.position
      }
    }
  }

  if (position === undefined) throw new Error('cannot locate position')

  await add({
    event: {
      type: 'receive',
      player: params.player,
      playerId: params.player.id,
      result: params.result,
      position,
      date: new Date(),
      scoutId: currentStudio.scout.id,
      sport: 'volleyball',
      teamId: currentStudio.scout.event.teamId,
      createdByUserId: undefined,
      points: undefined
    }
  })

  if (params.result == 'x') {
    autoPoint({
      opponent: !params.player.isOpponent
    })
  } else {
    if (!params.player.isOpponent) {
      await manualPhase({
        phase: 'defenseSideOut'
      })
    } else {
      await manualPhase({
        phase: 'defenseBreak'
      })
    }
  }
}

export function getPlayerPositions(params: {
  playerPositions: VolleyballPlayersPosition | undefined,
  player: ScoutEventPlayer
}): VolleyballScoutEventPosition | undefined {
  if (!!params.playerPositions) {
    let currentPosition = params.player.isOpponent ?
      params.playerPositions.enemy :
      params.playerPositions.friends

    for (const [pos, value] of Object.entries(currentPosition)) {
      if (Number(value.player.id) == Number(params.player.id)) return Number(pos) as VolleyballScoutEventPosition
    }
  }

  return undefined
}

async function autoPoint(params: {
  opponent: boolean
}) {
  await pointScored({
    opponent: params.opponent
  })
}

async function autoRotation(params: {
  phase: NonNullable<Scout['stash']>['phase'],
  opponent: boolean
}) {
  if (!params.opponent &&
    params.phase == 'receive' ||
    params.phase == 'defenseSideOut'
  ) {
    await teamRotation({
      opponent: false
    })

    await manualPhase({
      phase: 'serve'
    })
  }

  if (params.opponent &&
    params.phase == 'serve' ||
    params.phase == 'defenseBreak'
  ) {
    await teamRotation({
      opponent: true
    })

    await manualPhase({
      phase: 'receive'
    })
  }
}