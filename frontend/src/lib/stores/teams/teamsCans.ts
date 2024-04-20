import type { GroupCans } from '$lib/services/groups/groups.service'
import { writable } from 'svelte/store'

export type TeamCans = {
	cans: GroupCans
	owner: boolean
}

const store = writable<TeamCans | undefined>(undefined)
export default store
