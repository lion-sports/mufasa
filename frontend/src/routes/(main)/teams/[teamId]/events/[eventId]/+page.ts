import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { DateTime } from 'luxon'

export const load = (async ({ parent, fetch, params }) => {
  throw redirect(302, `/teams/${params.teamId}/events/${params.eventId}/general`)
}) satisfies PageLoad
