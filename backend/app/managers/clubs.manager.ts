import Club from '#models/Club'
import FilterModifierApplier, { type Modifier } from '#app/Services/FilterModifierApplier'
import { createClubValidator, updateClubValidator } from '#validators/clubs/index'
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js'
import { Context, withTransaction, withUser } from './base.manager.js'
import User from '#models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from '@adonisjs/lucid/types/model'
import type { Sport } from 'lionn-common'
import MediaManager from './media.manager.js'
import Member from '#models/Member'

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
  public async mine(params: {
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
      .where(b => {
        return AuthorizationHelpers.userCanInClubQuery({
          data: {
            query: b,
            user,
            resource: 'team',
            action: 'create'
          },
          context: params.context
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
  public async publicList(params: {
    data: {
      page: number
      perPage: number
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    let trx = params.context?.trx as TransactionClientContract

    let query = Club.query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    query.where('public', true)

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
      sport?: Sport,
      public?: boolean
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
      public?: boolean
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
        ability: 'club_update',
        data: {
          club
        },
      },
      context: params.context
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
  public async uploadMedia(params: {
    data: {
      club: { id: number }
      logo?: Parameters<MediaManager['upload']>[0]['data']
      header?: Parameters<MediaManager['upload']>[0]['data']
    }
    context?: Context
  }): Promise<Club> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let club = await Club.query({
        client: trx,
      })
      .where('id', params.data.club.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'club_update',
        data: {
          club
        },
      },
      context: params.context
    })

    let mediaManager = new MediaManager()

    if(!!params.data.logo) {
      if(!!club.logoMediaId) {
        await mediaManager.delete({
          data: {
            media: {
              id: club.logoMediaId
            }
          },
          context: {
            user, trx
          }
        })
      }

      let logoMedia = await mediaManager.upload({
        data: params.data.logo,
        context: {
          user,
          trx,
        },
      })
      club.logoMediaId = logoMedia.id
    }

    if(!!params.data.header) {
      if (!!club.headerMediaId) {
        await mediaManager.delete({
          data: {
            media: {
              id: club.headerMediaId
            }
          },
          context: {
            user, trx
          }
        })
      }

      let headerMedia = await mediaManager.upload({
        data: params.data.header,
        context: {
          user,
          trx,
        },
      })
      club.headerMediaId = headerMedia.id
    }

    await club.save()
    if(!!club.logoMediaId) await club.load('logo')
    if(!!club.headerMediaId) await club.load('header')

    return club
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
        ability: 'club_destroy',
        data: {
          club
        },
      },
      context: params.context,
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

    let canViewTeams = await AuthorizationManager.can({
      data: {
        actor: user,
        ability: 'team_view',
        data: {
          club: { id: params.data.id }
        },
      },
      context: params.context
    })

    let club = await Club.query({ client: trx })
      .where('id', params.data.id)
      .preload('owner')
      .preload('members', b => b.preload('group').preload('user'))
      .preload('teams', b => {
        b.if(!canViewTeams, b => {
          return AuthorizationHelpers.viewableTeamsQuery({
            data: {
              query: b,
              user
            },
            context: params.context
          })
        })
        .preload('teammates')
      })
      .preload('setting')
      .preload('places')
      .preload('groups')
      .firstOrFail()

    return club
  }

  @withTransaction
  public async getByName(params: {
    data: {
      name: string
    }
    context?: Context
  }): Promise<Club> {
    let trx = params.context?.trx as TransactionClientContract
    let user = params.context?.user

    if(!!user) {
      let club = await Club.query({ client: trx })
        .where('name', params.data.name)
        .preload('owner')
        .preload('members', b => b.preload('group').preload('user'))
        .preload('groups')
        .preload('places')
        .firstOrFail()

      let canViewTeams = await AuthorizationManager.can({
        data: {
          actor: user,
          ability: 'team_view',
          data: {
            club: { id: club.id }
          },
        },
        context: params.context
      })

      await club.load('teams', b => {
        b.if(!canViewTeams, b => {
          return AuthorizationHelpers.viewableTeamsQuery({
            data: {
              query: b,
              user
            },
            context: params.context
          })
        })
        .preload('teammates')
      })

      return club
    } else {
      return await Club.query({ client: trx })
        .where('name', params.data.name)
        .where('public', true)
        .preload('owner')
        .preload('members', b => b.preload('group').preload('user'))
        .preload('places')
        .firstOrFail()
    }
  }

  @withTransaction
  @withUser
  public async userBelogsToClub(params: {
    data: {
      club: { id: number }
      user: { id: number }
    }
    context?: Context
  }) {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    if (!params.data.club || !params.data.club.id) throw new Error('team must be defined')
    if (!params.data.user || !params.data.user.id) throw new Error('user must be defined')

    const userBelongs = await User.query({
        client: trx,
      })
      .whereHas('clubs', (builder) => {
        builder.where('clubs.id', params.data.club.id)
      })
      .where('users.id', params.data.user.id)

    return userBelongs.length != 0
  }

  @withTransaction
  @withUser
  public async addUser(params: {
    data: {
      club: {
        id: number
      }
      user: {
        id: number
      }
      group?: {
        id: number
      }
    }
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    if (!params.data.club || !params.data.club.id) throw new Error('club must be defined')
    if (!params.data.user || !params.data.user.id) throw new Error('user must be defined')

    let existingMembers = await Member.query({
        client: trx,
      })
      .where('clubId', params.data.club.id)
      .where('userId', params.data.user.id)

    if (existingMembers.length != 0) return

    const club = await Club.findOrFail(params.data.club.id, {
      client: trx,
    })

    await club.related('members').create({
      groupId: params.data.group?.id,
      userId: params.data.user.id
    })
  }
}