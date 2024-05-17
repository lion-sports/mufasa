import { FetchBasedService } from '$lib/services/common/fetchBased.service'

export type Group = {
	id: number
	name: string
	convocable: boolean
	cans?: any
	createdAt: Date
	updatedAt: Date
}

export type PaginatedGroups = {
	data: Group[]
	meta: PaginationData
}

export const resources = [
  'Team', 
  'Invitation', 
  'Event', 
  'Convocation', 
  'EventSession', 
  'Group',
  'Shirt',
  'Scout'
] as const
export type Resource = typeof resources[number]

export const actionsForResources: { [key: string]: Action[] } = {
	Team: ['update', 'invite', 'removeUser', 'destroy'],
  Teammate: ['update'],
	Event: ['create', 'update', 'destroy', 'convocate'],
	Group: ['update'],
	Convocation: ['confirm', 'deny'],
  Shirt: ['create', 'update', 'view', 'destroy'],
  Scout: ['manage', 'view'],
}

export type Action =
  'update' |
  'destroy' |
  'create' |
  'view' |
  'invite' |
  'removeUser' |
  'accept' |
  'reject' |
  'discard' |
  'convocate' |
  'confirm' |
  'deny' |
  'manage'

export type GroupCans = {
	[key: string]: {
		[key: string]: boolean
	}
}

export default class GroupsService extends FetchBasedService {
	public async create(params: { name?: string; convocable?: boolean; cans?: any }): Promise<Group> {
		if (!params.name) throw new Error('name must be defined')

		let response = await this.client.post({
			url: '/groups',
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
	}): Promise<PaginatedGroups> {
		if (!params.team || !params.team.id) throw new Error('team must be defined')
		if (!params.page) params.page = 1
		if (!params.perPage) params.perPage = 300

		let response = await this.client.get({
			url: `/teams/${params.team.id}/groups`,
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

	public async show(params: { id: number }): Promise<Group> {
		let response = await this.client.get({
			url: '/groups/' + params.id
		})

		return response
	}

	public async update(params: {
		id: number
		name?: string
		convocable?: boolean
		cans?: GroupCans
	}): Promise<Group> {
		let response = await this.client.put({
			url: '/groups/' + params.id,
			body: params
		})

		return response
	}

	public async destroy(params: { id: number }): Promise<void> {
		let response = await this.client.delete({
			url: '/groups/' + params.id
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
			Group: 'Gruppi',
      Teammate: 'Membro',
      Scout: 'Scout',
      ScoringSystem: 'Sistemi di punteggio',
      Shirt: 'Maglie'
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
			convocate: 'Convocare',
      manage: 'Gestire'
		}
		return translationMapping[action]
	}
}
