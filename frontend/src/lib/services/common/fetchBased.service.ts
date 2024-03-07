import { browser } from '$app/environment'
import UrlService from './urls.service'
import qs from 'qs'
import JsCookies from 'js-cookie'
import download from 'downloadjs'
import type { Cookies } from '@sveltejs/kit'

export type PostParams = {
	url: string
	body?: any
	headers?: Record<string, string>
	baseUrl?: 'api' | 'self'
}

export type MultiPartFormDataPostParams = {
	url: string
	body?: FormData
	headers?: Record<string, string>
	baseUrl?: 'api' | 'self'
}

export type PutParams = PostParams

export type DeleteParams = PostParams

export type GetParams = {
	url: string
	params?: string | string[][] | Record<string, any> | URLSearchParams | undefined
	headers?: Record<string, string>
	baseUrl?: 'api' | 'self'
}

export type GetWithDownloadParams = GetParams & {
	fileExt?: 'pdf' | 'xlsx' | 'csv'
	fileMime?:
		| 'application/pdf'
		| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		| 'text/csv'
	fileName?: string
}

export type ApiClient = {
	multiPartFormDataPost: (params: MultiPartFormDataPostParams) => Promise<any>
	post: (params: PostParams) => Promise<any>
	put: (params: PutParams) => Promise<any>
	delete: (params: DeleteParams) => Promise<any>
	get: (params: GetParams) => Promise<any>
	getWithDownload: (params: GetWithDownloadParams) => Promise<any>
}

export abstract class FetchBasedService {
	protected fetch: any
	protected cookies: Cookies | undefined
	protected urls: {
		api: string
		self: string
	}
	protected cookieName: string = 'session'
	protected refreshCookieName: string = 'session-refresh'
	protected token: string | undefined = undefined

	protected get client(): ApiClient {
		return {
			multiPartFormDataPost: this.__multiPartFormDataPost.bind(this),
			post: this.__post.bind(this),
			put: this.__put.bind(this),
			delete: this.__delete.bind(this),
			get: this.__get.bind(this),
			getWithDownload: this.__getWithDownload.bind(this)
		}
	}

	constructor(params: {
		fetch: any
		cookies?: Cookies
		token?: string
		urls?: {
			api: string
			self: string
		}
	}) {
		if (!params.fetch) throw new Error('service must have a definition of fetch')

		if (browser) this.fetch = params.fetch.bind(window)
		else this.fetch = params.fetch

		this.cookies = params.cookies

		if (!!params.urls) {
			this.urls = params.urls
		} else {
			this.urls = {
				api: UrlService.api,
				self: ''
			}
		}

		this.token = params.token
	}

	private async __multiPartFormDataPost(params: MultiPartFormDataPostParams) {
		const response = await this.fetch(this._calculateApiUrl(params.url, params.baseUrl), {
			method: 'POST',
			headers: this._calculateHeaders(params.headers, true),
			body: params.body
		})

		if (response.status !== 200) {
			throw await response.json()
		}

		let jsonText = await response.text()
		if (!!jsonText) {
			return JSON.parse(jsonText)
		} else {
			return {}
		}
	}

	private async __post(params: PostParams) {
		const response = await this.fetch(this._calculateApiUrl(params.url, params.baseUrl), {
			method: 'POST',
			headers: this._calculateHeaders(params.headers),
			body: JSON.stringify(params.body)
		})

		if (response.status != 200) {
			throw await response.json()
		}

		let jsonText = await response.text()
		if (!!jsonText) {
			return JSON.parse(jsonText)
		} else {
			return {}
		}
	}

	private async __put(params: PutParams) {
		const response = await this.fetch(this._calculateApiUrl(params.url, params.baseUrl), {
			method: 'PUT',
			headers: this._calculateHeaders(params.headers),
			body: JSON.stringify(params.body)
		})

		if (response.status != 200) {
			throw await response.json()
		}

		return response.json()
	}

	private async __delete(params: DeleteParams) {
		const response = await this.fetch(this._calculateApiUrl(params.url, params.baseUrl), {
			method: 'DELETE',
			headers: this._calculateHeaders(params.headers),
			body: JSON.stringify(params.body)
		})

		if (response.status != 200) {
			throw await response.json()
		}

		let jsonText = await response.text()
		if (!!jsonText) {
			return JSON.parse(jsonText)
		} else {
			return {}
		}
	}

	private async __get(params: GetParams) {
		return await this.fetch(
			this._calculateApiUrl(params.url, params.baseUrl) + '?' + qs.stringify(params.params),
			{
				headers: this._calculateHeaders(params.headers)
			}
		).then((response: any) => {
			if (response.status != 200) throw response
			else return response.json()
		})
	}

	private async __getWithDownload(params: GetWithDownloadParams) {
		return await this.fetch(
			this._calculateApiUrl(params.url, params.baseUrl) + '?' + qs.stringify(params.params),
			{
				headers: this._calculateHeaders(params.headers, true),
				length
			}
		)
			.then((response: any) => {
				if (response.status != 200) throw response
				else {
					return response.blob()
				}
			})
			.then((blob: Blob) => {
				download(
					blob,
					`${params.fileName || 'report'}.${params.fileExt || 'pdf'}`,
					params.fileMime || 'xlsx'
				)
				return blob
			})
	}

	private _calculateApiUrl(url: string, baseUrl?: 'api' | 'self') {
		if (!baseUrl) return this.urls.api + url
		else return this.urls[baseUrl] + url
	}

	private _calculateHeaders(
		paramsHeader?: Record<string, string>,
		multiFormData?: boolean
	): Record<string, string> {
		let headers: Record<string, string> = {}
		if (!!paramsHeader) headers = paramsHeader

		let token: string | undefined = this.token
		if (!token) token = this.cookies?.get(this.cookieName)
		if (!token && browser) token = JsCookies.get('session')

		if (!!token) headers['Authorization'] = 'Bearer ' + token

		if (multiFormData !== true) {
			headers['Content-Type'] = 'application/json'
		}

		return headers
	}
}
