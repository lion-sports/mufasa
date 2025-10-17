import { Context, withTransaction, withUser } from './base.manager.js'
import User from '#app/Models/User'
import Mongo from '#services/Mongo'
import { ObjectId } from 'mongodb'
import { InvitationStatus } from '#models/Invitation'

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
  _id?: ObjectId
  userId: number
  read: boolean
  firedAt: Date
  type: NotificationType
  info: NotificationInfo
}

export default class NotificationsManager {
  public collectionName = 'notifications'

  @withTransaction
  @withUser
  public async createNotification(params: {
    data: {
      userId: number
      type: NotificationType
      info: NotificationInfo
    }
    context?: Context
  }): Promise<Notification> {
    await Mongo.init()

    const notification: Notification = {
      userId: params.data.userId,
      read: false,
      firedAt: new Date(),
      type: params.data.type,
      info: params.data.info
    }

    await Mongo.insertOne({
      item: notification,
      collectionName: this.collectionName
    })

    return notification
  }

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number
      perPage?: number
      read?: boolean
    }
    context?: Context
  }): Promise<{
    data: Notification[]
    meta: {
      total: number
      page: number
      perPage: number
      totalPages: number
    }
  }> {
    const user = params.context?.user as User
    await Mongo.init()

    const page = Math.max(1, parseInt(String(params.data.page || 1)) || 1)
    const perPage = Math.min(100, Math.max(1, parseInt(String(params.data.perPage || 20)) || 20))
    const skip = (page - 1) * perPage

    const query: any = { userId: user.id }
    if (params.data.read !== undefined) {
      query.read = params.data.read
    }

    const collection = Mongo.db.collection(this.collectionName)

    const total = await collection.countDocuments(query)
    const notifications = await collection
      .find(query)
      .sort({ firedAt: -1 })
      .skip(skip)
      .limit(perPage)
      .toArray()

    const totalPages = Math.ceil(total / perPage)

    return {
      data: notifications as Notification[],
      meta: {
        total,
        page,
        perPage,
        totalPages
      }
    }
  }

  @withTransaction
  @withUser
  public async markAsRead(params: {
    data: {
      notificationId: string
    }
    context?: Context
  }): Promise<boolean> {
    const user = params.context?.user as User
    await Mongo.init()

    const collection = Mongo.db.collection(this.collectionName)
    const result = await collection.updateOne(
      {
        _id: new ObjectId(params.data.notificationId),
        userId: user.id
      },
      {
        $set: { read: true }
      }
    )

    return result.modifiedCount > 0
  }

  @withTransaction
  @withUser
  public async markAllAsRead(params: {
    context?: Context
  }): Promise<number> {
    const user = params.context?.user as User
    await Mongo.init()

    const collection = Mongo.db.collection(this.collectionName)
    const result = await collection.updateMany(
      {
        userId: user.id,
        read: false
      },
      {
        $set: { read: true }
      }
    )

    return result.modifiedCount
  }

  @withTransaction
  @withUser
  public async getUnreadCount(params: {
    context?: Context
  }): Promise<number> {
    const user = params.context?.user as User
    await Mongo.init()

    const collection = Mongo.db.collection(this.collectionName)
    return await collection.countDocuments({
      userId: user.id,
      read: false
    })
  }

  @withTransaction
  public async createInvitationNotification(params: {
    data: {
      userId: number
      invitationId: number
      invitedByUserId: number
      teamId?: number
      clubId?: number
      groupId?: number
    }
    context?: Context
  }): Promise<Notification> {
    await Mongo.init()

    const notification: Notification = {
      userId: params.data.userId,
      read: false,
      firedAt: new Date(),
      type: 'invitation',
      info: {
        invitation: {
          id: params.data.invitationId,
          invitedByUserId: params.data.invitedByUserId,
          teamId: params.data.teamId,
          clubId: params.data.clubId,
          groupId: params.data.groupId
        }
      }
    }

    await Mongo.insertOne({
      item: notification,
      collectionName: this.collectionName
    })

    return notification
  }
}