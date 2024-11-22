import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DashboardManager from 'App/managers/dashboard.manager'

export default class DashboardController {
  public async index({ request }: HttpContextContract) {
    const manager = new DashboardManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async store({ request }: HttpContextContract) {
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

  public async show({ params }: HttpContextContract) {
    const manager = new DashboardManager()
    return await manager.get({
      data: {
        id: params.id,
      },
    })
  }

  public async update({ request, params }: HttpContextContract) {
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

  public async destroy({ params }: HttpContextContract) {
    const manager = new DashboardManager()

    return await manager.destroy({
      data: {
        id: params.id,
      },
    })
  }
}
