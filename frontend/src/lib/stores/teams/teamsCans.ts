import type { RoleCans } from '$lib/services/roles/roles.service'
import { writable } from 'svelte/store'

export type TeamCans = {
	cans: RoleCans
	owner: boolean
}

const store = writable<TeamCans | undefined>(undefined)
export default store
