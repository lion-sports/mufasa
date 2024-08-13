import ScoutService, { type Scout, type ScoutEventPlayer, type ScoutStudio } from '$lib/services/scouts/scouts.service'
import type { VolleyballPhase, VolleyballScoutEventJson, VolleyballScoutEventPosition } from '$lib/services/scouts/volleyball'
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

export async function add(params: {
  event: VolleyballScoutEventJson
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