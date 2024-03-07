import type { Team } from '$lib/services/teams/teams.service'
import { writable } from 'svelte/store'

const store = writable<Team | undefined>(undefined)
export default store
