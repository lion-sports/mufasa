import { Context, withTransaction, withUser } from './base.manager.js'
import { validator } from '@adonisjs/validator'
import AuthorizationManager from './authorization.manager.js'
import FilterModifierApplier, { Modifier } from '#app/Services/FilterModifierApplier'
import {
  CreateScoringSystemValidator,
  UpdateScoringSystemValidator,
} from '#app/Validators/scoringSystems/index'
import { ModelObject } from '@adonisjs/lucid/types/model'

import ScoringSystem, { ScoringSystemConfig } from '#app/Models/ScoringSystem'
import User from '#app/Models/User'
import { Sport } from 'lionn-common'

export default class ScoringSystemsManager {
  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number
      perPage?: number
      filtersBuilder?: { modifiers: Modifier[] }
      order?: {
        column: string
        order?: 'desc' | 'asc'
      }[]
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    // TODO view the scoring system only to the user that has view scout
    let query = ScoringSystem.query({
      client: trx,
    })
      .preload('createdByUser')
      .preload('createdForTeam')
      .select('scoring_systems.*')
      .leftJoin('teams', 'scoring_systems.createdForTeamId', 'teams.id')
      .whereIn('teams.id', (b) => {
        b.select('teams2.id')
          .from('teams as teams2')
          .join('teammates as teammates2', 'teammates2.teamId', 'teams2.id')
          .where('teammates2.userId', user.id)
      })
      .orWhere('scoring_systems.createdByUserId', user.id)

    if (!!params.data.filtersBuilder) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
    }

    if (!!params.data.order) {
      query.orderBy(params.data.order)
    }

    const results = await query.paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      public?: boolean
      name: string
      sport: Sport
      config: ScoringSystemConfig
      createdForTeamId?: number
    }
    context?: Context
  }): Promise<ScoringSystem> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await validator.validate({
      schema: new CreateScoringSystemValidator().schema,
      data: params.data,
    })

    if (!!params.data.createdForTeamId) {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          ability: 'scoringSystem_create',
          data: {
            team: {
              id: params.data.createdForTeamId,
            },
          },
        },
        context: params.context,
      })
    }

    let scout = await ScoringSystem.create(
      {
        ...params.data,
        createdByUserId: user.id,
      },
      { client: trx }
    )

    await scout.load('createdByUser')
    if (!!scout.createdForTeamId) await scout.load('createdForTeam')
    return scout
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<ScoringSystem> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'scoringSystem_view',
        data: {
          scoringSystem: {
            id: params.data.id,
          },
        },
      },
      context: params.context,
    })

    let scoringSystem = await ScoringSystem.query({ client: trx })
      .where('id', params.data.id)
      .preload('createdByUser')
      .preload('createdForTeam')
      .firstOrFail()

    return scoringSystem
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      public?: boolean
      name?: string
      sport?: Sport
      config?: ScoringSystemConfig
    }
    context?: Context
  }): Promise<ScoringSystem> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'scoringSystem_manage',
        data: {
          scoringSystem: {
            id: params.data.id,
          },
        },
      },
      context: params.context,
    })

    await validator.validate({
      schema: new UpdateScoringSystemValidator().schema,
      data: params.data,
    })

    let scoringSystem = await ScoringSystem.findOrFail(params.data.id, { client: trx })

    scoringSystem.merge(params.data)
    await scoringSystem.save()
    scoringSystem.id = Number(scoringSystem.id)

    return scoringSystem
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<void> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'scoringSystem_manage',
        data: {
          scoringSystem: {
            id: params.data.id,
          },
        },
      },
      context: params.context,
    })

    await ScoringSystem.query({ client: trx }).where('id', params.data.id).del()
  }
}
