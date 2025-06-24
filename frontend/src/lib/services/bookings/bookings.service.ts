import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { FilterBuilder } from '@likable-hair/svelte'
import type { User } from '../auth/auth.service'
import type { Place } from '../places/places.service'

export const BOOKING_STATUSES = ['requested', 'confirmed', 'rejected'] as const
export type BookingStatus = typeof BOOKING_STATUSES[number]

export type Booking = {
	id: number
  from: Date
	to: Date
	createdByUserId: number
	createdByUser: User
  status: BookingStatus
	placeId: number
	place: Place
	createdAt: Date
	updatedAt: Date
}

export type PaginatedBookings = {
  data: Booking[],
  meta: PaginationData
}

export default class BookingService extends FetchBasedService {
	public async list(params: {
    page: number
    perPage: number
    filtersBuilder?: FilterBuilder
	}): Promise<PaginatedBookings> {
		let response: PaginatedBookings = await this.client.get({
			url: '/bookings',
			params: {
				page: params.page,
        perPage: params.perPage,
        filtersBuilder: params.filtersBuilder?.toJson()
			}
		})

    for(let i = 0; i < response.data.length; i += 1) {
      response.data[i].from = new Date(response.data[i].from)
      response.data[i].to = new Date(response.data[i].to)
    }

    return response
	}

  public async destroy(params: { id: number }): Promise<void> {
    let response = await this.client.delete({
      url: '/bookings/' + params.id
    })

    return response
  }

  public async get(params: { id: number }): Promise<Booking> {
    let response = await this.client.get({
      url: '/bookings/' + params.id
    })

    response.from = new Date(response.from)
    response.to = new Date(response.to)

    return response
  }

  public async request(params: {
    placeId: number
    from: Date
    to: Date
  }): Promise<Booking> {
    let response = await this.client.post({
      url: '/bookings/request',
      body: params
    })

    return response
  }

  public async update(params: {
    id: number
    placeId?: number
    from?: Date
    to?: Date
  }): Promise<Booking> {
    let response = await this.client.put({
      url: '/bookings/' + params.id,
      body: params
    })

    return response
  }
}
