import type { PageServerLoad } from './$types'
import AuthService from '$lib/services/auth/auth.service'

export const load = (async ({ fetch, cookies, url }) => {
	let token = url.searchParams.get('token')
	let refreshToken = url.searchParams.get('refreshToken')
	let expiresAt = url.searchParams.get('expires_at')
	let refreshTokenExpiration = url.searchParams.get('refreshTokenExpiration')

	if (!!token && !!expiresAt) {
		const service = new AuthService({ fetch, cookies })
		await service.loginWithGoogleCallback({
			token: token,
			refreshToken: refreshToken,
			refreshTokenExpiresAt: !!refreshTokenExpiration
				? new Date(refreshTokenExpiration)
				: undefined,
			expiresAt: new Date(expiresAt)
		})
	}

	return {
		token,
		refreshToken,
		expiresAt,
		refreshTokenExpiration
	}
}) satisfies PageServerLoad
