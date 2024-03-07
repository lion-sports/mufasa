import { error, json, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import AuthService from '$lib/services/auth/auth.service'

export const POST = (async ({ request, cookies, fetch }) => {
	let { password, email, generateRefreshToken } = await request.json()
	let service = new AuthService({ fetch, cookies })

	let response
	try {
		response = await service.authenticateApi({
			data: {
				email,
				password,
				generateRefreshToken
			}
		})
	} catch (err: any) {
		throw error(500, {
			message: err.message
		})
	}

	return json(response)
}) satisfies RequestHandler
