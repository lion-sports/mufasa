import type { HttpContext } from '@adonisjs/core/http'
import BookingsManager from '#app/managers/bookings.manager'

export default class BookingsController {
  public async index({ request, auth }: HttpContext) {
    const manager = new BookingsManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
      context: {
        user: auth.user
      }
    })
  }

  public async request({ request }: HttpContext) {
    const manager = new BookingsManager()

    return await manager.request({
      data: {
        placeId: request.input('placeId'),
        from: request.input('from'),
        to: request.input('to'),
      },
    })
  }

  public async show({ params, auth }: HttpContext) {
    const manager = new BookingsManager()

    return await manager.get({
      data: {
        id: params.id,
      },
      context: {
        user: auth.user
      }
    })
  }

  public async update({ params, request }: HttpContext) {
    const manager = new BookingsManager()

    return await manager.update({
      data: {
        id: params.id,
        placeId: request.input('placeId'),
        from: request.input('from'),
        to: request.input('to'),
      }
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new BookingsManager()

    return await manager.destroy({
      data: {
        id: params.id,
      }
    })
  }

  public async confirm({ params }: HttpContext) {
    const manager = new BookingsManager()

    return await manager.confirm({
      data: {
        bookingId: params.id,
      },
    })
  }
}
