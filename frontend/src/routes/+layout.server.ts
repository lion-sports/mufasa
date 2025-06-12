import AuthService from '$lib/services/auth/auth.service'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ fetch, cookies, url, depends }) => {
	let service = new AuthService({ fetch, cookies })
	depends('/')

	let fetchedUser
	if (
		url.pathname != '/auth/login' &&
		url.pathname != '/auth/confirmSignup' &&
		url.pathname != '/auth/signup' &&
		url.pathname != '/auth/google/callback'
	) {
		try {
			try {
				fetchedUser = await service.me()
			} catch (err) {
				if (!!service.refreshToken) {
					await service.authenticateApiWithRefreshToken({
						data: {
							refreshToken: service.refreshToken
						}
					})

					fetchedUser = await service.me()
				} else throw err
			}
		} catch (error) {
			await service.deleteTokenCookie()
			throw redirect(302, '/auth/login')
		}
	}

	return {
		user: fetchedUser,
		token: cookies.get('session')
	}
}) satisfies LayoutServerLoad
