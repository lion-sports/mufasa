import Club from '#models/Club'
import FilterModifierApplier, { type Modifier } from '#app/Services/FilterModifierApplier'
import { createClubValidator, updateClubValidator } from '#validators/clubs/index'
import AuthorizationManager from './authorization.manager.js'
import { Context, withTransaction, withUser } from './base.manager.js'
import User from '#models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from '@adonisjs/lucid/types/model'
import type { Sport } from 'lionn-common'

export default class ClubsManager {
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

    let query = Club.query({ client: trx })
      .where(b => {
        b.where('ownerId', user.id)
          .orWhereHas('members', b => {
            b.where('userId', user.id)
          })
      })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

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
      completeName: string
      bio?: string
      sport?: Sport
    }
    context?: Context
  }): Promise<Club> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await createClubValidator.validate(params.data)

    const createdClub = await Club.create(
      {
        ...validatedData,
        ownerId: user.id,
        sport: validatedData.sport || 'none'
      },
      {
        client: trx,
      }
    )

    await createdClub.related('members').create({
      userId: user.id
    }, {
      client: trx
    })

    return createdClub
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      name?: string
      completeName?: string
      bio?: string
      sport?: Sport
    }
    context?: Context
  }): Promise<Club> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let club = await Club.query({
        client: trx,
      })
      .where('id', params.data.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'club',
        entities: {
          club
        },
      },
      context: {
        trx: trx,
      },
    })

    let validatedData = await updateClubValidator.validate(params.data)

    club.merge({
      ...validatedData
    })

    let results = await club.save()
    return results
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

    let club = await Club.query({ client: trx }).where('id', params.data.id).firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'destroy',
        resource: 'club',
        entities: {
          club
        },
      },
      context: {
        trx: trx,
      },
    })

    await club.delete()
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Club> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let club = await Club.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'club',
        entities: {
          club
        },
      },
      context: {
        trx: trx,
      },
    })

    return club
  }
}