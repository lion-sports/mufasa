import type { Event } from '$lib/services/events/events.service'
import { writable } from 'svelte/store'

const store = writable<Event | undefined>(undefined)
export default store
