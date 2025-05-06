import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { User } from '../auth/auth.service'
import type { Group } from '../groups/groups.service'
import type { Invitation } from '../invitations/invitations.service'
import type { Role } from '../scouts/scouts.service'
import type { Shirt } from '../shirts/shirts.service'

export type Teammate = {
	id: number
	groupId?: number
	group?: Group
	teamId: number
	uid?: string
	userId: number
	user: User
	alias?: string
	shirts: Shirt[]
	defaultRole: Role
	availableRoles: Role[]
	createdAt: Date
	updatedAt: Date
}

export type Team = {
	id: number
	name: string
	notes: string
	ownerId?: number
	invitations?: Invitation[]
	owner?: User
	teammates: Teammate[]
	groups?: Group[]
	createdAt: Date
	updatedAt: Date
}

export type PaginatedTeams = {
	data: Team[]
	meta: PaginationData
}

export default class TeamsService extends FetchBasedService {
	public async create(params: { name?: string; notes?: string }): Promise<Team> {
		if (!params.name) throw new Error('name must be defined')

		let response = await this.client.post({
			url: '/teams',
			body: params
		})

		return response
	}

	public async list(params?: { page?: number; perPage?: number }): Promise<PaginatedTeams> {
		if (!params)
			params = {
				page: 1,
				perPage: 300
			}
		if (!params.page) params.page = 1
		if (!params.perPage) params.perPage = 300

		let response = await this.client.get({
			url: '/teams',
			params: params
		})

		return response
	}

	public async show(params: { id: number }): Promise<Team> {
		let response = await this.client.get({
			url: '/teams/' + params.id
		})

		return response
	}

	public async update(params: { id: number; name?: string; notes?: string }): Promise<Team> {
		let response = await this.client.put({
			url: '/teams/' + params.id,
			body: params
		})

		return response
	}

	public async absencesInLatestEvents(params: { forLastEvents: number }): Promise<
		Record<
			number,
			{
				team: {
					id: number
					name: string
				}
				absences: {
					eventId: number
					absencesNumber: number
				}[]
				presences: {
					eventId: number
					presencesNumber: number
				}[]
			}
		>
	> {
		let response = await this.client.get({
			url: '/teams/absencesInLatestEvents',
			params: {
				forLastEvents: params.forLastEvents
			}
		})

		return response
	}
}
