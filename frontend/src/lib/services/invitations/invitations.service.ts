import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import { browser } from '$app/environment'
import type { User } from '../auth/auth.service'
import type { Team } from '$lib/services/teams/teams.service'
import type { Role } from '$lib/services/roles/roles.service'

export type Invitation = {
	id: number
	invitedBy: User
	invitedUser?: User
	invitedEmail: string
	team: Team
	role?: Role
}

export default class InvitationsService extends FetchBasedService {
	constructor(params: { fetch: any }) {
		super({
			fetch: params.fetch
		})
	}

	public async inviteUser(params: {
		team: { id: number }
		user: { email: string }
		role?: { id: number }
	}): Promise<Invitation> {
		if (!browser) throw new Error('only available in browser')

		let response = await this.client.post({
			url: '/invitations/inviteUser',
			body: params
		})

		return response
	}

	public async removeUser(params: { team: { id: number }; user: { id: number } }): Promise<void> {
		if (!browser) throw new Error('only available in browser')
		if (!params.team.id) throw new Error('team must be defined')
		if (!params.user.id) throw new Error('user must be defined')

		await this.client.post({
			url: `/teams/${params.team.id}/removeUser`,
			body: params
		})
	}

	public async exit(params: { team: { id: number } }): Promise<void> {
		if (!browser) throw new Error('only available in browser')

		await this.client.post({
			url: `/teams/${params.team.id}/exit`
		})
	}

	public async invitationToAccept(): Promise<Invitation[]> {
		if (!browser) throw new Error('only available in browser')

		let response = await this.client.get({
			url: '/invitations/list'
		})

		return response
	}

	public async acceptInvitation(params: { invitation: { id: number } }): Promise<Invitation> {
		if (!browser) throw new Error('only available in browser')

		let response = await this.client.post({
			url: '/invitations/accept',
			body: params
		})

		return response
	}

	public async rejectInvitation(params: { invitation: { id: number } }): Promise<Invitation> {
		if (!browser) throw new Error('only available in browser')

		let response = await this.client.post({
			url: '/invitations/reject',
			body: params
		})

		return response
	}

	public async discardInvitation(params: { invitation: { id: number } }): Promise<Invitation> {
		if (!browser) throw new Error('only available in browser')

		let response = await this.client.post({
			url: '/invitations/discard',
			body: params
		})

		return response
	}
}
