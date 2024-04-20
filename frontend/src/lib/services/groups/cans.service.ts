import type { Resource, Action } from './groups.service'
import teamCans from '$lib/stores/teams/teamsCans'
import { get } from 'svelte/store'

export default class CansService {
	public static can(resource: Resource, action: Action): boolean {
		let cans = get(teamCans)
		if (!cans) return false
		else if (cans.owner) return true
		else return !!cans.cans?.[resource]?.[action]
	}
}
