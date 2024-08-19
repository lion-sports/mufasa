import ScoutService, { type Scout, type ScoutEventPlayer, type ScoutStudio } from '$lib/services/scouts/scouts.service'
import type { RotationType, VolleyballPhase, VolleyballPlayersPosition, VolleyballScoutEventParameters, VolleyballScoutEventPosition } from '$lib/services/scouts/volleyball'
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

studio.subscribe((value) => {
  if(!!value) {
    socketService.off(`teams:${value.scout.event.teamId}:scout:stashReload`, handleStashReload)
    socketService.on(`teams:${value.scout.event.teamId}:scout:stashReload`, handleStashReload)
  }

  return () => {
    if(!!value) socketService.off(`teams:${value.scout.event.teamId}:scout:stashReload`, handleStashReload)
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
}

export async function playerSubstitution(params: {
  playerOut: ScoutEventPlayer,
  playerIn: ScoutEventPlayer
}) {
  let currentStudio = get(studio)
  if (!currentStudio) throw new Error('cannot call without a studio')

  let playerIsOpponent = params.playerOut.isOpponent,
    playerId = params.playerOut.id,
    position: VolleyballScoutEventPosition | undefined = undefined,
    playerIdIn = params.playerIn.id

  if(!!currentStudio.scout.stash?.playersServePositions) {
    let currentPosition = playerIsOpponent ? 
      currentStudio.scout.stash?.playersServePositions?.enemy :
      currentStudio.scout.stash?.playersServePositions?.friends

    for (const [pos, value] of Object.entries(currentPosition)) {
      if(Number(value.player.id) == Number(playerId)) position = Number(pos) as VolleyballScoutEventPosition
    }
  }

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
    liberoId = params.libero.id,
    position: VolleyballScoutEventPosition | undefined = undefined

  if (!!currentStudio.scout.stash?.playersServePositions) {
    let currentPosition = opponent ?
      currentStudio.scout.stash?.playersServePositions?.enemy :
      currentStudio.scout.stash?.playersServePositions?.friends

    for (const [pos, value] of Object.entries(currentPosition)) {
      if (params.inOrOut == 'in' && Number(value.player.id) == Number(playerId)) position = Number(pos) as VolleyballScoutEventPosition 
      if (params.inOrOut == 'out' && Number(value.player.id) == Number(liberoId)) position = Number(pos) as VolleyballScoutEventPosition 
    }
  }

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