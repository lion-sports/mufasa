import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import { browser } from '$app/environment'

export type Role = {
	id: number
	name: string
	convocable: boolean
	cans?: any
	createdAt: Date
	updatedAt: Date
}

export type PaginatedRoles = {
	data: Role[]
	meta: PaginationData
}

export const resources = ['Team', 'Invitation', 'Event', 'Convocation', 'EventSession', 'Role']
export type Resource = 'Team' | 'Invitation' | 'Event' | 'Convocation' | 'EventSession' | 'Role'

export const actionsForResources: { [key: string]: string[] } = {
	Team: ['update', 'invite', 'removeUser', 'destroy'],
	Event: ['create', 'update', 'destroy', 'convocate'],
	Role: ['update'],
	Convocation: ['confirm', 'deny']
}

export type Action =
	| 'update'
	| 'destroy'
	| 'create'
	| 'view'
	| 'invite'
	| 'removeUser'
	| 'accept'
	| 'reject'
	| 'discard'
	| 'confirm'
	| 'deny'
	| 'convocate'

export type RoleCans = {
	[key: string]: {
		[key: string]: boolean
	}
}

export default class RolesService extends FetchBasedService {
	public async create(params: { name?: string; convocable?: boolean; cans?: any }): Promise<Role> {
		if (!params.name) throw new Error('name must be defined')

		let response = await this.client.post({
			url: '/roles',
			body: params
		})

		return response
	}

	public async list(params: {
		page?: number
		perPage?: number
		team: {
			id: number
		}
	}): Promise<PaginatedRoles> {
		if (!params.team || !params.team.id) throw new Error('team must be defined')
		if (!params.page) params.page = 1
		if (!params.perPage) params.perPage = 300

		let response = await this.client.get({
			url: `/teams/${params.team.id}/roles`,
			params: {
				page: params.page,
				perPage: params.perPage,
				team: {
					id: params.team.id
				}
			}
		})

		return response
	}

	public async show(params: { id: number }): Promise<Role> {
		let response = await this.client.get({
			url: '/roles/' + params.id
		})

		return response
	}

	public async update(params: {
		id: number
		name?: string
		convocable?: boolean
		cans?: RoleCans
	}): Promise<Role> {
		let response = await this.client.put({
			url: '/roles/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/roles/' + params.id
		})

		return response
	}

	public static getActionsForResource(resource: string): string[] {
		return actionsForResources[resource]
	}

	public static translateResource(resource: string): string {
		let translationMapping: {
			[key: string]: string
		} = {
			Team: 'Team',
			Invitation: 'Inviti',
			Event: 'Eventi',
			Convocation: 'Convocazioni',
			EventSession: 'Sessioni',
			Role: 'Ruoli'
		}
		return translationMapping[resource]
	}

	public static translateActions(action: string): string {
		let translationMapping: {
			[key: string]: string
		} = {
			update: 'Modificare',
			destroy: 'Eliminare',
			create: 'Creare',
			view: 'Visualizzare',
			invite: 'Invitare',
			removeUser: 'Rimuovere utenti',
			accept: 'Accettare',
			reject: 'Rifiutare',
			discard: 'Annullare',
			confirm: 'Confermare',
			deny: 'Non confermare',
			convocate: 'Convocare'
		}
		return translationMapping[action]
	}
}
