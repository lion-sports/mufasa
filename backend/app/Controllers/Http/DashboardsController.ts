import type { HttpContext } from '@adonisjs/core/http'
import DashboardManager from '#app/managers/dashboard.manager'

export default class DashboardController {
  public async index({ request }: HttpContext) {
    const manager = new DashboardManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new DashboardManager()
    let createdReportStatus = await manager.create({
      data: {
        name: request.input('name'),
        active: request.input('active'),
        widgets: request.input('widgets'),
      },
    })

    return createdReportStatus
  }

  public async show({ params }: HttpContext) {
    const manager = new DashboardManager()
    return await manager.get({
      data: {
        id: params.id,
      },
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new DashboardManager()
    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        active: request.input('active'),
        widgets: request.input('widgets'),
      },
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new DashboardManager()

    return await manager.destroy({
      data: {
        id: params.id,
      },
    })
  }
}
