import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import WidgetSettingsManager from 'App/managers/widgetSettings.manager'

export default class WidgetSettingsController {
  public async set({ request }: HttpContextContract) {
    let widgetId = request.input('widgetId')
    let settings = request.input('settings')

    const manager = new WidgetSettingsManager()
    return await manager.set({
      data: {
        widget: {
          id: widgetId
        },
        settings
      }
    })
  }
}
