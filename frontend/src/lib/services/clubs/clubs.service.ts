import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'
import type { Sport } from 'lionn-common'
import type { User } from '../auth/auth.service'
import type { Media } from '../media/media.service'
import type { Member } from '../members/members.service'
import type { Group } from '../groups/groups.service'
import type { Team } from '../teams/teams.service'
import type { ClubSetting } from '../clubSettings/clubSettings.service'
import type { Place } from '../places/places.service'

export type Club = {
	id: number
  name: string,
  completeName: string
  bio?: string
  sport?: Sport
  ownerId: number
  public?: boolean
  owner: User
  headerMediaId?: number
  header?: Media
  logoMediaId?: number
  logo?: Media
  members?: Member[]
  groups?: Group[]
  teams?: Team[]
  places?: Place[]
  setting?: ClubSetting
	createdAt: Date
	updatedAt: Date
}

export type PaginatedClubs = {
	data: Club[]
	meta: PaginationData
}

export default class ClubsService extends FetchBasedService {
	public async create(params: {
    name: string
    completeName: string
    bio?: string
    sport?: Sport
    public?: boolean
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

		let response: PaginatedClubs = await this.client.get({
			url: '/clubs',
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

  public async mine(params?: {
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

    let response: PaginatedClubs = await this.client.get({
      url: '/clubs/mine',
      params: {
        page: params.page,
        perPage: params.perPage,
        filtersBuilder: params.filtersBuilder?.toJson()
      }
    })

    for (let i = 0; i < response.data.length; i += 1) {
      response.data[i].createdAt = new Date(response.data[i].createdAt)
      response.data[i].updatedAt = new Date(response.data[i].updatedAt)
    }

    return response
  }

	public async get(params: { id: number }): Promise<Club> {
		let response = await this.client.get({
			url: '/clubs/' + params.id
		})

		response.createdAt = new Date(response.createdAt)
		response.updatedAt = new Date(response.updatedAt)

		return response
	}

  public async getByName(params: { name: string }): Promise<Club> {
    let response = await this.client.get({
      url: '/clubs/getByName',
      params: {
        name: params.name
      }
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
    public?: boolean
	}): Promise<Club> {
		let response = await this.client.put({
			url: '/clubs/' + params.id,
			body: params
		})

		return response
	}

  public async uploadMedia(params: { logo?: File; header?: File; clubId: number }): Promise<void> {
    let formData = new FormData()
    if (!!params.logo) formData.append('logo', params.logo)
    if (!!params.header) formData.append('header', params.header)

    await this.client.multiPartFormDataPost({
      url: `/clubs/${params.clubId}/uploadMedia`,
      body: formData
    })
  }

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/clubs/' + params.id
		})

		return response
	}
}