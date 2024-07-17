import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'

export type Shirt = {
  id: number
  name?: string
  number: number
  teammateId: number
  primaryColor?: string
  secondaryColor?: string
  createdAt?: Date
  updatedAt?: Date
}

export type PaginatedShirts = {
  data: Shirt[]
  meta: PaginationData
}

export default class ShirtService extends FetchBasedService {
  public async create(params: {
    number: number
    name?: string
    teammateId: number
    primaryColor?: string
    secondaryColor?: string
  }): Promise<Shirt> {
    let response = await this.client.post({
      url: '/shirts',
      body: params
    })

    return response
  }

  public async list(params?: { 
    page?: number
    perPage?: number
    filtersBuilder?: FilterBuilder
  }): Promise<PaginatedShirts> {
    if (!params)
      params = {
        page: 1,
        perPage: 300
      }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 300

    let response = await this.client.get({
      url: '/shirts',
      params: params
    })

    return response
  }

  public async show(params: { id: number }): Promise<Shirt> {
    let response = await this.client.get({
      url: '/shirts/' + params.id
    })

    response.createdAt = new Date(response.createdAt)
    response.updatedAt = new Date(response.updatedAt)

    return response
  }

  public async update(params: {
    id: number;
    number?: number
    name?: string
    teammateId?: number
    primaryColor?: string
    secondaryColor?: string
  }): Promise<Shirt> {
    let response = await this.client.put({
      url: '/shirts/' + params.id,
      body: params
    })

    return response
  }

  public async destroy(params: { id: number }): Promise<void> {
    let response = await this.client.delete({
      url: '/shirts/' + params.id
    })

    return response
  }
}
