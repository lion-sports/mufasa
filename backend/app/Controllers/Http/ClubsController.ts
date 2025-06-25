import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import ClubsManager from '#app/managers/clubs.manager'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import path from 'path'
import MediaManager from '#app/managers/media.manager'
import Club from '#models/Club'
import AuthorizationManager from '#app/managers/authorization.manager'

export default class ClubsController {
  public async index({ request }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.list({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async mine({ request }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.mine({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async publicList({ request }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.publicList({
      data: {
        page: request.input('page'),
        perPage: request.input('perPage'),
        filtersBuilder: request.input('filtersBuilder'),
      },
    })
  }

  public async store({ request }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.create({
      data: {
        name: request.input('name'),
        completeName: request.input('completeName'),
        bio: request.input('bio'),
        sport: request.input('sport'),
        public: request.input('public')
      },
    })
  }

  public async show({ params, auth }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.get({
      data: {
        id: params.id,
      }
    })
  }

  public async getByName({ request, auth }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.getByName({
      data: {
        name: request.input('name'),
      },
      context: {
        user: auth.user
      }
    })
  }

  public async update({ request, params }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.update({
      data: {
        id: params.id,
        name: request.input('name'),
        completeName: request.input('completeName'),
        bio: request.input('bio'),
        sport: request.input('sport'),
        public: request.input('public')
      },
    })
  }

  public async destroy({ params }: HttpContext) {
    const manager = new ClubsManager()

    return await manager.destroy({
      data: {
        id: params.id,
      },
    })
  }

  public async uploadMedia({ request, params }: HttpContext) {
    let logo = request.file('logo')
    let header = request.file('header')
    if (!logo && !header) throw new Error('no logo or header provided')

    let logoTmpPath = app.tmpPath(cuid())
    if(!!logo) {
      await logo.move(logoTmpPath, {
        name: logo.clientName,
      })
    }

    let headerTmpPath = app.tmpPath(cuid())
    if (!!header) {
      await header.move(headerTmpPath, {
        name: header.clientName,
      })
    }

    let manager = new ClubsManager()
    return await manager.uploadMedia({
      data: {
        club: {
          id: params.id,
        },
        logo: !!logo ? {
          extension: logo.extname || '',
          from: {
            path: path.join(logoTmpPath, logo.clientName),
          },
          driveName: env.get('DRIVE_DISK', 'local'),
        } : undefined,
        header: !!header ? {
          extension: header.extname || '',
          from: {
            path: path.join(headerTmpPath, header.clientName),
          },
          driveName: env.get('DRIVE_DISK', 'local'),
        } : undefined,
      },
    })
  }

  public async downloadMedia({ request, params, response, auth }: HttpContext) {
    const manager = new MediaManager()

    let club = await Club.query()
      .where('logoMediaId', params.id)
      .orWhere('headerMediaId', params.id)
      .firstOrFail()

    if(!!auth.user) {
      await AuthorizationManager.canOrFail({
        data: {
          ability: 'club_view',
          data: {
            club
          },
          actor: auth.user
        }
      })
    } else if(!auth.user && !club.public) {
      throw new Error('cannot view image')
    }

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
      console.log(e)
      if (e.code === 'E_CANNOT_READ_FILE') {
        response.status(404)
      } else throw e
    }
  }

  public async downloadThumbnail({ request, params, response, auth }: HttpContext) {
    const manager = new MediaManager()

    let club = await Club.query()
      .where('logoMediaId', params.id)
      .orWhere('headerMediaId', params.id)
      .firstOrFail()

    if (!!auth.user) {
      await AuthorizationManager.canOrFail({
        data: {
          actor: auth.user,
          ability: 'club_view',
          data: {
            club
          },
        }
      })
    } else if (!auth.user && !club.public) {
      throw new Error('cannot view image')
    }

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

    let club = await Club.query()
      .where('logoMediaId', params.id)
      .orWhere('headerMediaId', params.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: auth.user,
        ability: 'club_view',
        data: {
          club
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
