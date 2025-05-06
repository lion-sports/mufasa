import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load = (async ({ params }) => {
	throw redirect(302, `/teams/${params.teamId}/teammates/${params.teammateId}/edit`)
}) satisfies PageLoad
