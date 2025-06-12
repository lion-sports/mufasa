import { HttpContext } from '@adonisjs/core/http'
import MediaManager from '#app/managers/media.manager'

export default class MediaController {
  public async download({ request, params, response }: HttpContext) {
    const manager = new MediaManager()

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

  public async downloadWithFilename({ params, response }: HttpContext) {
    const manager = new MediaManager()

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
      response.header('Content-Disposition', 'inline')

      return mediaInfo.buffer
    } catch (e) {
      if (e.code === 'E_CANNOT_READ_FILE') {
        response.status(404)
      } else throw e
    }
  }

  public async downloadThumbnail({ request, params, response }: HttpContext) {
    const manager = new MediaManager()

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

  public async show({ params }: HttpContext) {
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
