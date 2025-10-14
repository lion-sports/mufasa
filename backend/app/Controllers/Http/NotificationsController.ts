import type { HttpContext } from '@adonisjs/core/http'
import NotificationsManager from '#app/managers/notifications.manager'

export default class NotificationsController {
  public async list({ request }: HttpContext) {
    const manager = new NotificationsManager()

    const page = request.input('page')
    const perPage = request.input('perPage')
    const read = request.input('read')

    return await manager.list({
      data: {
        page: page ? parseInt(String(page)) : undefined,
        perPage: perPage ? parseInt(String(perPage)) : undefined,
        read: read !== undefined ? read === 'true' || read === true : undefined
      }
    })
  }

  public async markAsRead({ request }: HttpContext) {
    const manager = new NotificationsManager()

    const notificationId = request.input('notificationId')

    return await manager.markAsRead({
      data: {
        notificationId: notificationId
      }
    })
  }

  public async markAllAsRead({}: HttpContext) {
    const manager = new NotificationsManager()

    return await manager.markAllAsRead({})
  }

  public async getUnreadCount({}: HttpContext) {
    const manager = new NotificationsManager()

    return await manager.getUnreadCount({})
  }
}