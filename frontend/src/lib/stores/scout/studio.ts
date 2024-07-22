import ScoutService, { type Scout, type ScoutStudio } from '$lib/services/scouts/scouts.service'
import type { VolleyballScoutEventJson } from '$lib/services/scouts/volleyball'
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
  event: Omit<VolleyballScoutEventJson, 'createdByUserId' | 'points'>
}) {
  socketService.io?.emit(`teams:${params.event.teamId}:scout:add`, params.event)
}