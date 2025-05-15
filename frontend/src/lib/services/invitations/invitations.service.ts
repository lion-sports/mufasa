import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import { browser } from '$app/environment'
import type { User } from '../auth/auth.service'
import type { Team } from '$lib/services/teams/teams.service'
import type { Group } from '$lib/services/groups/groups.service'
import { FilterBuilder } from '@likable-hair/svelte'

export type Invitation = {
	id: number
	invitedBy: User
	invitedUser?: User
	invitedEmail: string
	status: 'pending' | 'rejected' | 'accepted' | 'discarded'
	team: Team
	group?: Group
  createdAt: Date
  updatedAt: Date
}

export type PaginatedInvitation = {
  data: Invitation[]
  meta: PaginationData
}

export default class InvitationsService extends FetchBasedService {
	public async inviteUser(params: {
		team?: { id: number }
		user: { email: string }
		group?: { id: number }
    club?: { id: number }
	}): Promise<Invitation> {
		let response = await this.client.post({
			url: '/invitations/inviteUser',
			body: params
		})

		return response
	}

  public async list(params?: {
    page?: number
    perPage?: number
    filtersBuilder?: FilterBuilder
  }): Promise<PaginatedInvitation> {
    if (!params)
      params = {
        page: 1,
        perPage: 300
      }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 300

    let response: PaginatedInvitation = await this.client.get({
      url: '/invitations/list',
      params: {
        page: params.page,
        perPage: params.perPage,
        filtersBuilder: params.filtersBuilder?.toJson()
      }
    })

    for(let i = 0; i < response.data.length; i += 1) {
      response.data[i].createdAt = new Date(response.data[i].createdAt)
      response.data[i].updatedAt = new Date(response.data[i].updatedAt)
    }

    return response
  }

	public async removeUser(params: { team: { id: number }; user: { id: number } }): Promise<void> {
		if (!params.team.id) throw new Error('team must be defined')
		if (!params.user.id) throw new Error('user must be defined')

		await this.client.post({
			url: `/teams/${params.team.id}/removeUser`,
			body: params
		})
	}

	public async exit(params: { team: { id: number } }): Promise<void> {
		await this.client.post({
			url: `/teams/${params.team.id}/exit`
		})
	}

	public async invitationToAccept(): Promise<Invitation[]> {
    let builder = new FilterBuilder()
    builder.where('status', 'pending')
    
		let response = await this.list({
      page: 1,
      perPage: 100,
      filtersBuilder: builder
    })

    return response.data
	}

	public async acceptInvitation(params: { invitation: { id: number } }): Promise<Invitation> {
		let response = await this.client.post({
			url: '/invitations/accept',
			body: params
		})

		return response
	}

	public async rejectInvitation(params: { invitation: { id: number } }): Promise<Invitation> {
		let response = await this.client.post({
			url: '/invitations/reject',
			body: params
		})

		return response
	}

	public async discardInvitation(params: { invitation: { id: number } }): Promise<Invitation> {
		let response = await this.client.post({
			url: '/invitations/discard',
			body: params
		})

		return response
	}
}
