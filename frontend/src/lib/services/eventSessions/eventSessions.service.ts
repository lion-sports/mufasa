import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Team } from '$lib/services/teams/teams.service'
import type { User } from '../auth/auth.service'
import type { Convocation } from '$lib/services/convocations/convocations.service'
import type { Scout } from '../scouts/scouts.service'
import type { Event } from '../events/events.service'

export type EventSession = {
  id: number
  uid: string
  name: string
  ownedByUserId: number
  ownedBy: User
  teamId: number
  team: Team
  events: Event[]
  createdAt: Date
  updatedAt: Date
}

export type PaginatedEventSession = {
  data: EventSession[]
  meta: PaginationData
}

export default class EventSessionsService extends FetchBasedService {
	public async list(params: {
    page: number
    perPage: number
	}): Promise<PaginatedEventSession[]> {
		let response = await this.client.get({
			url: '/eventSessions',
			params: {
        page: params.page,
        perPage: params.perPage
			}
		})

		return response.data.map((el: any) => {
			el.createdAt = new Date(el.createdAt)
			el.updatedAt = new Date(el.updatedAt)
			return el
		})
	}

	public async create(params: {
		name: string
	}): Promise<Event[]> {
		let response = await this.client.post({
			url: '/eventSessions',
			body: {
				event: params
			}
		})

		return response
	}

	public async show(params: { id: number }): Promise<Event> {
		let response = await this.client.get({
			url: '/eventSessions/' + params.id
		})

    response.createdAt = new Date(response.createdAt)
		response.updatedAt = new Date(response.updatedAt)

		return response
	}

	public async update(params: {
		id: number
		name?: string
	}): Promise<Event> {
		let response = await this.client.put({
			url: '/eventSessions/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/eventSessions/' + params.id
		})

		return response
	}

  public async addEvents(params: { 
    eventSession: { id: number },
    events: { id: number }[]
  }): Promise<void> {
    let response = await this.client.post({
      url: '/eventSessions/' + params.eventSession.id + '/addEvents',
      body: {
        eventSession: params.eventSession,
        events: params.events
      }
    })

    return response
  }

  public async removeEvents(params: {
    eventSession: { id: number },
    events: { id: number }[]
  }): Promise<void> {
    let response = await this.client.post({
      url: '/eventSessions/' + params.eventSession.id + '/removeEvents',
      body: {
        eventSession: params.eventSession,
        events: params.events
      }
    })

    return response
  }

  public async setEvents(params: {
    eventSession: { id: number },
    events: { id: number }[]
  }): Promise<void> {
    let response = await this.client.post({
      url: '/eventSessions/' + params.eventSession.id + '/setEvents',
      body: {
        eventSession: params.eventSession,
        events: params.events
      }
    })

    return response
  }
}
