import type { HttpContext } from '@adonisjs/core/http'
import WidgetSettingsManager from '#app/managers/widgetSettings.manager'

export default class WidgetSettingsController {
  public async set({ request }: HttpContext) {
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
