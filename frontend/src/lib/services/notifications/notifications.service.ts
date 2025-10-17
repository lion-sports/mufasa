import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import type { InvitationStatus } from '../invitations/invitations.service'

export type NotificationType = 'invitation'

export type NotificationInfo = {
  invitation?: {
    id: number
    invitedByUserId: number
    teamId?: number
    clubId?: number
    groupId?: number
    status?: InvitationStatus
  }
}

export type Notification = {
  _id: string
  userId: number
  read: boolean
  firedAt: Date
  type: NotificationType
  info: NotificationInfo
}

export type PaginatedNotifications = {
  data: Notification[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}

export default class NotificationsService extends FetchBasedService {
  public async list(params?: {
    page?: number
    perPage?: number
    read?: boolean
  }): Promise<PaginatedNotifications> {
    if (!params) {
      params = {
        page: 1,
        perPage: 20
      }
    }
    if (!params.page) params.page = 1
    if (!params.perPage) params.perPage = 20

    let response: PaginatedNotifications = await this.client.get({
      url: '/notifications/list',
      params: {
        page: params.page,
        perPage: params.perPage,
        read: params.read
      }
    })

    // Convert date strings to Date objects
    for (let i = 0; i < response.data.length; i += 1) {
      response.data[i].firedAt = new Date(response.data[i].firedAt)
    }

    return response
  }

  public async markAsRead(params: {
    notificationId: string
  }): Promise<boolean> {
    let response = await this.client.post({
      url: '/notifications/markAsRead',
      body: params
    })

    return response
  }

  public async markAllAsRead(): Promise<number> {
    let response = await this.client.post({
      url: '/notifications/markAllAsRead',
      body: {}
    })

    return response
  }

  public async getUnreadCount(): Promise<number> {
    let response = await this.client.get({
      url: '/notifications/unreadCount'
    })

    return response
  }

  public async getUnreadNotifications(): Promise<Notification[]> {
    let response = await this.list({
      page: 1,
      perPage: 100,
      read: false
    })

    return response.data
  }
}