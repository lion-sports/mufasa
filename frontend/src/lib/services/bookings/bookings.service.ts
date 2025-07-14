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
  notes?: string
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
    notes?: string
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
    notes?: string
  }): Promise<Booking> {
    let response = await this.client.put({
      url: '/bookings/' + params.id,
      body: params
    })

    return response
  }

  public static getBookingColor(booking: Booking): {
    background: string,
    foreground: string
  } {
    const colors = [
      { background: '#c7eaff', foreground: '#222' }, // light sky blue
      { background: '#b3ffd9', foreground: '#222' }, // mint
      { background: '#d1d8ff', foreground: '#222' }, // periwinkle
      { background: '#b3e6ff', foreground: '#222' }, // pale blue
      { background: '#b3fff6', foreground: '#222' }, // aqua
      { background: '#c7fff6', foreground: '#222' }, // pale turquoise
      { background: '#d1fff2', foreground: '#222' }, // light teal
      { background: '#b3f0ff', foreground: '#222' }, // ice blue
      { background: '#d1f7ff', foreground: '#222' }, // powder blue
      { background: '#b3e6f7', foreground: '#222' }  // pale cyan
    ]

    return colors[booking.placeId % colors.length]
  }
}
