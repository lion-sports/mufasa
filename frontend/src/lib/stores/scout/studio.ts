import ScoutService, { type Scout, type ScoutEventPlayer, type ScoutStudio } from '$lib/services/scouts/scouts.service'
import type { VolleyballScoutEventJson, VolleyballScoutEventPosition } from '$lib/services/scouts/volleyball'
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