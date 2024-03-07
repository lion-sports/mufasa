import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import { browser } from '$app/environment'

import type { Event } from '$lib/services/events/events.service'
import type { Teammate } from '$lib/services/teams/teams.service'
import type { User } from '../auth/auth.service'

export type Convocation = {
	id: number
	confirmationStatus?: 'confirmed' | 'denied' | 'pending'
	confirmedBy?: User
	updateConfirmationAt?: Date
	eventId: number
	event: Omit<Event, 'convocations'>
	teammateId: number
	teammate: Teammate
	notes: string
	createdAt: Date
	updatedAt: Date
}

export type PaginatedConvocations = {
	data: Convocation[]
	meta: PaginationData
}

export default class ConvocationsService extends FetchBasedService {
	constructor(params: { fetch: any }) {
		super({
			fetch: params.fetch
		})
	}

	public async confirm(params: { id: number }): Promise<Convocation> {
		let response = await this.client.post({
			url: '/convocations/' + params.id + '/confirm'
		})

		return response
	}

	public async deny(params: { id: number }): Promise<Convocation> {
		let response = await this.client.post({
			url: '/convocations/' + params.id + '/deny'
		})

		return response
	}

	public async convocate(params: {
		event: {
			id: number
		}
		teammates: {
			id: number
		}[]
	}): Promise<Convocation[]> {
		if (!params.event) throw new Error('event not specified')
		else if (!params.teammates || params.teammates.length == 0)
			throw new Error('teammates null or empty')

		let response = await this.client.post({
			url: '/events/' + params.event.id + '/convocate',
			body: {
				teammates: params.teammates
			}
		})

		return response
	}

	public async unConvocate(params: {
		event: {
			id: number
		}
		teammates: {
			id: number
		}[]
	}): Promise<Convocation> {
		if (!params.event) throw new Error('event not specified')
		else if (!params.teammates || params.teammates.length == 0)
			throw new Error('teammates null or empty')

		let response = await this.client.post({
			url: '/events/' + params.event.id + '/unConvocate',
			body: {
				teammates: params.teammates
			}
		})

		return response
	}
}
