import type { HttpContext } from '@adonisjs/core/http'
import PlacesManager from '#app/managers/places.manager'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import path from 'path'
import MediaManager from '#app/managers/media.manager'
import Place from '#models/Place'
import AuthorizationManager from '#app/managers/authorization.manager'

export default class PlacesController {
  public async index({ request }: HttpContext) {
    const manager = new PlacesManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new PlacesManager()

    return await manager.create({
      data: {
        name: request.input('name'),
        address: request.input('address'),
        description: request.input('description'),
        clubId: request.input('clubId')
      },
    })
  }

  public async show({ params }: HttpContext) {
    const manager = new PlacesManager()

    return await manager.get({
      data: {
        id: params.id,
      },
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new PlacesManager()

    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        address: request.input('address'),
        description: request.input('description'),
        clubId: request.input('clubId')
      },
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new PlacesManager()

    return await manager.destroy({
      data: {
        id: params.id,
      },
    })
  }

  public async uploadMedia({ request, params }: HttpContext) {
    let cover = request.file('cover')
    if (!cover) throw new Error('no cover provided')

    let coverTmpPath = app.tmpPath(cuid())
    if (!!cover) {
      await cover.move(coverTmpPath, {
        name: cover.clientName,
      })
    }

    let manager = new PlacesManager()
    return await manager.uploadMedia({
      data: {
        place: {
          id: params.id,
        },
        cover: !!cover ? {
          extension: cover.extname || '',
          from: {
            path: path.join(coverTmpPath, cover.clientName),
          },
          driveName: 'local',
        } : undefined,
      }
    })
  }

  public async downloadMedia({ request, params, response, auth }: HttpContext) {
    const manager = new MediaManager()
    if (!auth.user) throw new Error('user is not defined')

    let place = await Place.query()
      .where('coverId', params.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        ability: 'place_view',
        data: {
          place
        },
        actor: auth.user
      }
    })

    try {
      let mediaInfo = await manager.download({
        data: {
          media: {
            id: params.id,
          },
        },
      })

      response.header('content-type', mediaInfo.media.mime)
      response.header('content-length', mediaInfo.buffer.length)

      return mediaInfo.buffer
    } catch (e) {
      if (e.code === 'E_CANNOT_READ_FILE') {
        response.status(404)
      } else throw e
    }
  }

  public async downloadThumbnail({ request, params, response, auth }: HttpContext) {
    const manager = new MediaManager()
    if (!auth.user) throw new Error('user is not defined')

    let place = await Place.query()
      .where('coverId', params.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: auth.user,
        ability: 'place_view',
        data: {
          place
        },
      }
    })

    try {
      let mediaInfo = await manager.downloadThumbnail({
        data: {
          media: {
            id: params.id,
          },
          height: request.input('height'),
          width: request.input('width'),
          fit: request.input('fit')
        },
      })

      response.header('content-type', 'image/jpeg')
      response.header('content-length', mediaInfo.buffer.length)

      return mediaInfo.buffer
    } catch (e) {
      console.log(e)
      if (e.code === 'E_CANNOT_READ_FILE') {
        response.status(404)
      } else throw e
    }
  }

  public async showMedia({ params, auth }: HttpContext) {
    if (!auth.user) throw new Error('user is not defined')

    let place = await Place.query()
      .where('coverId', params.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: auth.user,
        ability: 'place_view',
        data: {
          place
        },
      }
    })

    const manager = new MediaManager()
    return await manager.get({
      data: {
        media: {
          id: params.id,
        },
      },
    })
  }
}