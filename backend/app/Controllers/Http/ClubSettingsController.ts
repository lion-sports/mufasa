import type { HttpContext } from '@adonisjs/core/http'
import ClubSettingsManager from '#app/managers/clubSettings.manager'

export default class ClubSettingsController {
  public async set({ request }: HttpContext) {
    const manager = new ClubSettingsManager()

    return await manager.set({
      data: {
        clubId: request.input('clubId'),
        key: request.input('key'),
        value: request.input('value')
      },
    })
  }

  public async get({ request }: HttpContext) {
    const manager = new ClubSettingsManager()

    return await manager.get({
      data: {
        key: request.input('key'),
        clubId: request.input('clubId'),
      },
    })
  }
}