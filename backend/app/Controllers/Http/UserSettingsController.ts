import type { HttpContext } from '@adonisjs/core/http'
import UserSettingsManager from '#app/managers/userSettings.manager'

export default class UserSettingsController {
  public async set({ request }: HttpContext) {
    const manager = new UserSettingsManager()

    return await manager.set({
      data: {
        key: request.input('key'),
        value: request.input('value')
      },
    })
  }

  public async get({ request }: HttpContext) {
    const manager = new UserSettingsManager()

    return await manager.get({
      data: {
        key: request.input('key')
      },
    })
  }
}