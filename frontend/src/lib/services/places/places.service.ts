import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'
import type { Media } from '../media/media.service'
import type { Club } from '../clubs/clubs.service'

export type Place = {
	id: number
	name: string
	address?: string
	description?: string
	coverId?: number
  cover?: Media
	clubId?: number
  club?: Club
	createdAt: Date
	updatedAt: Date
}

export type PaginatedPlaces = {
	data: Place[]
	meta: PaginationData
}

export default class PlaceService extends FetchBasedService {
	public async create(params: {
    name: string
    address?: string
    description?: string
    coverId?: number
    clubId: number
	}): Promise<Place> {
		let response = await this.client.post({
			url: '/places',
			body: params
		})

		return response
	}

	public async list(params?: {
		page?: number
		perPage?: number
		filtersBuilder?: FilterBuilder
	}): Promise<PaginatedPlaces> {
		if (!params)
			params = {
				page: 1,
				perPage: 300
			}
		if (!params.page) params.page = 1
		if (!params.perPage) params.perPage = 300

		let response: PaginatedPlaces = await this.client.get({
			url: '/places',
			params: {
				page: params.page,
				perPage: params.perPage,
				filtersBuilder: params.filtersBuilder?.toJson()
			}
		})

    for(let i = 0; i < response.data.length; i += 1) {
      response.data[i].createdAt = new Date(response.data[i].createdAt)
      response.data[i].updatedAt = new Date(response.data[i].updatedAt)
    }

		return response
	}

	public async show(params: { id: number }): Promise<Place> {
		let response = await this.client.get({
			url: '/places/' + params.id
		})

		response.createdAt = new Date(response.createdAt)
		response.updatedAt = new Date(response.updatedAt)

		return response
	}

	public async update(params: {
		id: number
    name?: string
    address?: string
    description?: string
    coverId?: number
    clubId?: number
	}): Promise<Place> {
		let response = await this.client.put({
			url: '/places/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/places/' + params.id
		})

		return response
	}

  public async uploadMedia(params: { 
    cover?: File 
    placeId: number 
  }): Promise<void> {
    let formData = new FormData()
    if (!!params.cover) formData.append('cover', params.cover)

    await this.client.multiPartFormDataPost({
      url: `/places/${params.placeId}/uploadMedia`,
      body: formData
    })
  }
}
