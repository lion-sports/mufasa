import AuthService from '$lib/services/auth/auth.service'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { goto } from '$app/navigation'

export const load: PageLoad = async ({ fetch, url }) => {
	try {
		const token = url.searchParams.get('token')

		if (token) {
			const service = new AuthService({ fetch })
			const us = await service.verifySignup({ token })
		}

		await goto('/auth/login')
	} catch (err) {
		console.log(err)
		throw redirect(302, '/auth/login')
	}
}
