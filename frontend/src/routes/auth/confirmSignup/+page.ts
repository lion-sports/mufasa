import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, url }) => {
	try {
		const token = url.searchParams.get('token')
		return { token }
	} catch (err) {
		throw redirect(302, '/auth/signup')
	}
}
