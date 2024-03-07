import { derived } from 'svelte/store'
import team from './teamsShow'
import user from '../auth/user'
import type { Teammate } from '$lib/services/teams/teams.service'

const store = derived<[typeof team, typeof user], Teammate | undefined>(
	[team, user],
	([$team, $user]) => {
		if (!!$team && !!$user) {
			return $team.teammates.find((tm) => tm.userId == $user.id)
		} else {
			return undefined
		}
	}
)
export default store
