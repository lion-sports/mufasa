import type { Scout } from '$lib/services/scouts/scouts.service'
import type { VolleyballScoutEventJson } from '$lib/services/scouts/volleyball'
import { writable } from 'svelte/store'
import socketService from '$lib/services/common/socket.service';

const store = writable<{ scout: Scout } | undefined>(undefined)
export default store

export async function add(params: {
  event: Omit<VolleyballScoutEventJson, 'createdByUserId' | 'points'>
}) {
  socketService.io?.emit(`teams:${params.event.teamId}:scout:add`, params.event)
}