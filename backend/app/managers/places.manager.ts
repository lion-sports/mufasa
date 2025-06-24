import Place from '#models/Place'
import FilterModifierApplier, { type Modifier } from '#app/Services/FilterModifierApplier'
import { createPlaceValidator, updatePlaceValidator } from '#validators/places/index'
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js'
import { Context, withTransaction, withUser } from './base.manager.js'
import User from '#models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from '@adonisjs/lucid/types/model'
import Club from '#models/Club'
import MediaManager from './media.manager.js'

export default class PlacesManager {
  constructor() { }

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page: number
      perPage: number
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let query = Place.query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    query = query.andWhere(b => {
      return AuthorizationHelpers.viewablePlacesQuery({
        data: {
          query: b,
          user,
        },
        context: params.context
      })
    })

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let results = await query.paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      name: string,
      address?: string
      description?: string,
      clubId: number
    }
    context?: Context
  }): Promise<Place> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await createPlaceValidator.validate(params.data)

    let club = await Club.query({ client: trx })
      .where('id', validatedData.clubId)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'place_create',
        data: {
          club
        },
      },
      context: params.context
    })

    const createdPlace = await Place.create(
      {
        ...validatedData
      },
      {
        client: trx,
      }
    )

    return createdPlace
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      name?: string,
      address?: string
      description?: string,
      clubId?: number
    }
    context?: Context
  }): Promise<Place> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await updatePlaceValidator.validate(params.data)

    let place = await Place.query({
        client: trx,
      })
      .where('id', params.data.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'place_update',
        data: {
          place
        },
      },
      context: params.context
    })

    place.merge({
      ...validatedData
    })

    let results = await place.save()
    return results
  }


  @withTransaction
  @withUser
  public async uploadMedia(params: {
    data: {
      place: { id: number }
      cover?: Parameters<MediaManager['upload']>[0]['data']
    }
    context?: Context
  }): Promise<Place> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let place = await Place.query({
        client: trx,
      })
      .where('id', params.data.place.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'place_update',
        data: {
          place
        },
      },
      context: params.context
    })

    let mediaManager = new MediaManager()

    if(!!params.data.cover) {
      if(!!place.cover) {
        await mediaManager.delete({
          data: {
            media: {
              id: place.coverId
            }
          },
          context: params.context
        })
      }

      let coverMedia = await mediaManager.upload({
        data: params.data.cover,
        context: params.context,
      })
      place.coverId = coverMedia.id
    }

    await place.save()
    if(!!place.coverId) await place.load('cover')

    return place
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<void> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let place = await Place.query({ client: trx }).where('id', params.data.id).firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'place_destroy',
        data: {
          place
        },
      },
      context: params.context
    })

    await place.delete()
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Place> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let place = await Place.query({ client: trx })
      .where('id', params.data.id)
      .preload('cover')
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'place_view',
        data: {
          place
        },
      },
      context: params.context
    })

    return place
  }
}