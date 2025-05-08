import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'
import type { Sport } from 'lionn-common'
import type { User } from '../auth/auth.service'

export type Club = {
	id: number
  name: string,
  completeName: string
  bio?: string
  sport?: Sport
  ownerId: number
  owner: User
	createdAt?: Date
	updatedAt?: Date
}

export type PaginatedClubs = {
	data: Club[]
	meta: PaginationData
}

export default class ClubsService extends FetchBasedService {
	public async create(params: {
		number: number
	}): Promise<Club> {
		let response = await this.client.post({
			url: '/clubs',
			body: params
		})

		return response
	}

	public async list(params?: {
		page?: number
		perPage?: number
		filtersBuilder?: FilterBuilder
	}): Promise<PaginatedClubs> {
		if (!params)
			params = {
				page: 1,
				perPage: 300
			}
		if (!params.page) params.page = 1
		if (!params.perPage) params.perPage = 300

		let response = await this.client.get({
			url: '/clubs',
			params: {
				page: params.page,
				perPage: params.perPage,
				filtersBuilder: params.filtersBuilder?.toJson()
			}
		})

		return response
	}

	public async show(params: { id: number }): Promise<Club> {
		let response = await this.client.get({
			url: '/clubs/' + params.id
		})

		response.createdAt = new Date(response.createdAt)
		response.updatedAt = new Date(response.updatedAt)

		return response
	}

	public async update(params: {
		id: number
    name?: string
    completeName?: string
    bio?: string
    sport?: Sport
	}): Promise<Club> {
		let response = await this.client.put({
			url: '/clubs/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/clubs/' + params.id
		})

		return response
	}
}
