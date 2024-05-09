import { Context, withTransaction, withUser } from "./base.manager";
import { validator } from "@ioc:Adonis/Core/Validator"
import User from "App/Models/User";
import AuthorizationManager from "./authorization.manager";
import FilterModifierApplier, { Modifier } from "App/Services/FilterModifierApplier";
import { ModelObject } from "@ioc:Adonis/Lucid/Orm";
import Scout, { Sport } from "App/Models/Scout";
import Event from "App/Models/Event";
import { DateTime } from "luxon";
import { CreateScoutValidator, UpdateScoutValidator } from "App/Validators/scouts";
import PlayersManager from "./players.manager";

export default class ScoutsManager {
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

    let query = Scout.query({
        client: trx,
      })
      .select('scouts.*')
      .preload('event')
      .preload('players')
      .join('events', 'events.id', 'scouts.eventId')
      .join('teams', 'events.teamId', 'teams.id')
      .whereIn('teams.id', b => {
        b.select('teams2.id')
          .from('teams as teams2')
          .join('teammates as teammates2', 'teammates2.teamId', 'teams2.id')
          .where('teammates2.userId', user.id)
      })

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
      sport: Sport
      name?: string
      startedAt?: DateTime,
      eventId: number,
      scoringSystemId?: number
    },
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'Scout',
        entities: {
          event: {
            id: params.data.eventId
          }
        }
      },
      context: {
        trx
      }
    })

    let validatedData = await validator.validate({
      schema: new CreateScoutValidator().schema,
      data: params.data
    })

    let scout = await Scout.create(validatedData, { client: trx })

    let event = await Event.query({ client: trx })
      .where('id', scout.eventId)
      .preload('convocations', b => b.preload('teammate', tb => tb.preload('shirts')))
      .firstOrFail()

    let playerManager = new PlayersManager()
    for(let i = 0; i < event.convocations.length; i += 1) {
      const convocation = event.convocations[i]

      await playerManager.create({
        data: {
          scoutId: scout.id,
          convocationId: convocation.id,
          shirtId: convocation.teammate.shirts[0]?.id
        },
        context: {
          trx,
          user
        }
      })
    }

    if(!!scout.scoringSystemId) await scout.load('scoringSystem')
    await scout.load('players')
    return scout
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'Scout',
        entities: {
          scout: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    let scout = await Scout
      .query({ client: trx })
      .preload('event')
      .preload('players')
      .preload('scoringSystem')
      .where('id', params.data.id)
      .firstOrFail()

    return scout
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      sport?: Sport
      name?: string
      startedAt?: DateTime,
      eventId?: number,
      scoringSystemId?: number
    },
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'Scout',
        entities: {
          scout: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    let validatedData = await validator.validate({
      schema: new UpdateScoutValidator().schema,
      data: params.data
    })

    let scout = await Scout
      .findOrFail(params.data.id, { client: trx })

    scout.merge(validatedData)
    await scout.save()

    if (!!scout.scoringSystemId) await scout.load('scoringSystem')
    await scout.load('players')
    return scout
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
        action: 'manage',
        resource: 'Scout',
        entities: {
          scout: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    await Scout.query({ client: trx })
      .where('id', params.data.id)
      .del()
  }
}