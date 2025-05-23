import AuthService from '$lib/services/auth/auth.service'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { goto } from '$app/navigation'

export const load: PageLoad = async ({ fetch, url }) => {
	try {
		const userId = url.searchParams.get('userId')
		// const token = url.searchParams.get('token')

		if (userId) {
			const service = new AuthService({ fetch })
			const us = await service.verifySignup({ userId })
			console.log(us)
		}

		await goto('/auth/login')
	} catch (err) {
		console.log(err)
		throw redirect(302, '/auth/login')
	}
}
