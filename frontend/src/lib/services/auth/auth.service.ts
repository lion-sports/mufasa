import { FetchBasedService } from '../common/fetchBased.service'
import type { Cookies } from '@sveltejs/kit'
import { browser } from '$app/environment'
import JsCookies from 'js-cookie'
import user from '$lib/stores/auth/user'
import { DateTime, Duration } from 'luxon'

export type User = {
	id: number
	firstname: string
	lastname: string
	email: string
	system: boolean
	avatarUrl?: string
	createdAt: Date
	updatedAt: Date
}

export type LoginParams = {
	data: {
		email: string
		password: string
		generateRefreshToken?: boolean
	}
	context?: {}
}

export type AuthenticateApiParams = {
	data: {
		email: string
		password: string
		generateRefreshToken?: boolean
	}
	context?: {}
}

export type AuthenticateApiWithRefreshTokenParams = {
	data: {
		refreshToken: string
	}
	context?: {}
}

export type SignupParams = {
	data: {
		email: string
		password: string
		firstname: string
		lastname: string
	}
	context?: {}
}

export default class AuthService extends FetchBasedService {
	constructor(params: { fetch: any; cookies?: Cookies; token?: string }) {
		super({
			fetch: params.fetch,
			cookies: params.cookies,
			token: params.token
		})
	}

	async login(params: LoginParams) {
		const response = await this.client.post({
			url: '/auth/login',
			body: {
				email: params.data.email,
				password: params.data.password,
				generateRefreshToken: params.data.generateRefreshToken
			},
			baseUrl: 'self'
		})

		if (!!response.errors) throw response

		let newUser = await this.me()
		user.set(newUser)

		return response
	}

	async signup(params: SignupParams) {
		if (browser) {
			const response = await this.client.post({
				url: '/auth/signup',
				body: {
					email: params.data.email,
					password: params.data.password,
					firstname: params.data.firstname,
					lastname: params.data.lastname
				}
			})

			return response
		}
	}

	async authenticateApi(params: AuthenticateApiParams) {
		const response: {
			type: 'bearer'
			token: string
			expires_at: Date
			userId: number
			refreshToken: string
			refreshTokenExpiration: Date
		} = await this.client
			.post({
				url: '/auth/login',
				body: {
					email: params.data.email,
					password: params.data.password,
					generateRefresh: params.data.generateRefreshToken
				}
			})
			.then((r) => {
				r.expires_at = new Date(r.expires_at)
				r.refreshTokenExpiration = new Date(r.refreshTokenExpiration)
				return r
			})

		const tokenExpiresIn = DateTime.fromJSDate(response.expires_at).diffNow('seconds')
		this.cookies?.set(this.cookieName, response.token, {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: tokenExpiresIn.seconds
		})

		if (!!response.refreshToken) {
			const refresTokenExpiresIn = DateTime.fromJSDate(response.refreshTokenExpiration).diffNow(
				'seconds'
			)
			this.cookies?.set(this.refreshCookieName, response.refreshToken, {
				path: '/',
				httpOnly: false,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: refresTokenExpiresIn.seconds
			})
		}

		return response
	}

	async authenticateApiWithRefreshToken(params: AuthenticateApiWithRefreshTokenParams) {
		const response = await this.client.post({
			url: '/auth/refreshToken',
			headers: {
				Authorization: 'Bearer ' + params.data.refreshToken
			}
		})

		this.cookies?.set('session', response.token, {
			path: '/',
			httpOnly: false,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30
		})

		return response
	}

	async loginWithGoogleCallback(params: {
		token: string
		expiresAt: Date
		refreshToken?: string | null
		refreshTokenExpiresAt?: Date
	}) {
		this.cookies?.set(this.cookieName, params.token, {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: DateTime.fromJSDate(params.expiresAt).diff(DateTime.now()).milliseconds / 1000
		})

		if (!!params.refreshToken && !!params.refreshTokenExpiresAt) {
			this.cookies?.set(this.refreshCookieName, params.refreshToken, {
				path: '/',
				httpOnly: false,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge:
					DateTime.fromJSDate(params.refreshTokenExpiresAt).diff(DateTime.now()).milliseconds / 1000
			})
		}
	}

	async loginWithGoogle() {
		if (browser) {
			window.location.href = this.urls.api + '/auth/google/redirect'
		}
	}

	get authToken(): string | undefined {
		if (browser) return JsCookies.get(this.cookieName)
		else return this.cookies?.get(this.cookieName)
	}

	get refreshToken(): string | undefined {
		if (browser) return JsCookies.get(this.refreshCookieName)
		else return this.cookies?.get(this.refreshCookieName)
	}

	async me(): Promise<User> {
		let response
		try {
			response = await this.client.get({
				url: '/auth/me'
			})
		} catch (error) {
			throw new Error('unable to get user')
		}

		return {
			id: response.id,
			email: response.email,
			firstname: response.firstname,
			lastname: response.lastname,
			system: response.system,
			avatarUrl: response.avatarUrl,
			createdAt: new Date(response.createdAt),
			updatedAt: new Date(response.updatedAt)
		}
	}

	async deleteTokenCookie(): Promise<void> {
		this.cookies?.delete(this.cookieName, { path: '/' })
	}

	async deleteRefreshTokenCookie(): Promise<void> {
		this.cookies?.delete(this.refreshCookieName, { path: '/' })
	}

	async logout(): Promise<void> {
		const response = await this.client.get({
			url: '/auth/logout',
			baseUrl: 'self'
		})

		if (browser) {
			JsCookies.remove(this.cookieName)
			JsCookies.remove(this.refreshCookieName)
		}

		user.set(undefined)
	}
}
