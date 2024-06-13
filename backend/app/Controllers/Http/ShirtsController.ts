import ShirtsManager from 'App/managers/shirts.manager'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ShirtsController {
  public async index({ request }: HttpContextContract) {
    const manager = new ShirtsManager()
    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
        order: request.input('order')
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const manager = new ShirtsManager()
    return await manager.create({
      data: {
        number: request.input('number'),
        name: request.input('name'),
        primaryColor: request.input('primaryColor'),
        secondaryColor: request.input('secondaryColor'),
        teammateId: request.input('teammateId')
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new ShirtsManager()
    return await manager.get({
      data: {
        id: params.id
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const manager = new ShirtsManager()
    return await manager.update({
      data: {
        id: params.id,
        number: request.input('number'),
        name: request.input('name'),
        primaryColor: request.input('primaryColor'),
        secondaryColor: request.input('secondaryColor'),
        teammateId: request.input('teammateId')
      }
    })
  }

  public async destroy({ params }: HttpContextContract) {
    const manager = new ShirtsManager()
    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }
}
