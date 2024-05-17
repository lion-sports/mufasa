import type { Resource, Action } from './groups.service'
import teamCansStore, { type TeamCans } from '$lib/stores/teams/teamsCans'
import { get } from 'svelte/store'

export default class CansService {
	public static can(resource: Resource, action: Action, teamCans: TeamCans | undefined = undefined): boolean {
    let cans: any = !!teamCans ? teamCans : get(teamCansStore)
		if (!cans) return false
		else if (cans.owner) return true
		else return !!cans.cans?.[resource]?.[action]
	}
}
