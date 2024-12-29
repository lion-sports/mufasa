import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { Team } from '$lib/services/teams/teams.service'
import type { User } from '../auth/auth.service'
import type { Convocation } from '$lib/services/convocations/convocations.service'
import type { Scout } from '../scouts/scouts.service'

export type Event = {
	id: number
	start: Date
	end: Date
	name: string
	description: string
	status: 'confirmed' | 'notConfirmed'
	frequencyId: number
	teamId: number
	team: Team
	convocations: Convocation[]
  scouts: Scout[]
	createdAt: Date
	updatedAt: Date
	createdBy: User
}

export default class EventsService extends FetchBasedService {
	public async list(params: {
		filters: {
			from: Date
			to: Date
			team?: {
				id: number
			}
		}
	}): Promise<Event[]> {
    let teamParameter = !!params.filters.team ? {
      id: params.filters.team?.id
    } : undefined

		let response = await this.client.get({
			url: '/events',
			params: {
        filters: {
          from: params.filters.from,
          to: params.filters.to,
          team: teamParameter
        }
      }
		})

		return response.map((el: any) => {
			el.start = new Date(el.start)
			el.end = new Date(el.end)
			return el
		})
	}

	public async create(params: {
		start: Date
		end: Date
		name: string
		description?: string
		team: {
			id: number
		}
		convocations: {
			teammateId: number
		}[]
	}): Promise<Event[]> {
		let response = await this.client.post({
			url: '/events',
			body: {
				event: params
			}
		})

		return response
	}

	public async copyWeek(params: {
		fromWeekNumber: number
		fromWeekYear: number
		toWeekNumber: number
		toWeekYear: number
		team: { id: number }
	}): Promise<Event[]> {
		let response = await this.client.post({
			url: '/events/copyWeek',
			body: params
		})

		return response.map((el: any) => {
			el.start = new Date(el.start)
			el.end = new Date(el.end)
			return el
		})
	}

	public async show(params: { id: number }): Promise<Event> {
		let response = await this.client.get({
			url: '/events/' + params.id
		})

		response.start = new Date(response.start)
		response.end = new Date(response.end)

		return response
	}

	public async update(params: { 
    id: number
    name?: string
    start?: Date
    end?: Date
  }): Promise<Event> {
		let response = await this.client.put({
			url: '/events/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/events/' + params.id
		})

		return response
	}
}
