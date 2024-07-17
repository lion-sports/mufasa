import { Context, withTransaction, withUser } from "../base.manager";
import { validator } from "@ioc:Adonis/Core/Validator"
import User from "App/Models/User";
import AuthorizationManager from "../authorization.manager";
import FilterModifierApplier, { Modifier } from "App/Services/FilterModifierApplier";
import { ModelObject } from "@ioc:Adonis/Lucid/Orm";
import Scout, { Sport } from "App/Models/Scout";
import Event from "App/Models/Event";
import { DateTime } from "luxon";
import { CreateScoutValidator, UpdateScoutValidator } from "App/Validators/scouts";
import PlayersManager from "../players.manager";
import { ScoutInfoGeneral } from "App/Models/ScoutInfo";

export type ScoutStudio = {
  scout: Scout
}

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
      scoringSystemId?: number,
      scoutInfo?: {
        general: ScoutInfoGeneral
      }
    },
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
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
    
    let scoutInfo = validatedData.scoutInfo
    delete validatedData.scoutInfo

    let scout = await Scout.create(validatedData, { client: trx })

    let event = await Event.query({ client: trx })
      .where('id', scout.eventId)
      .preload('convocations', b => b.preload('teammate', tb => tb.preload('shirts')))
      .firstOrFail()

    await scout.related('scoutInfo').create({
      general: scoutInfo?.general || {}
    }, {
      client: trx
    })

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
    await scout.load('scoutInfo')
    return scout
  }

  @withTransaction
  @withUser
  public async importTeammates(params: {
    data: {
      id: number,
      importShirts?: boolean
      importRoles?: boolean
      importAbsents?: boolean
    },
    context?: Context
  }): Promise<{
    success: boolean
  }> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'scout',
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

    let scout = await Scout.query({ client: trx })
      .where('id', params.data.id)
      .preload('event', b => 
        b.preload('convocations', b2 => 
          b2.preload('teammate', b3 => 
            b3.preload('shirts')
          )
        )
      )
      .preload('players')
      .firstOrFail()

    for(let i = 0; i < scout.event.convocations.length; i += 1) {
      let convocation = scout.event.convocations[i]

      if(!params.data.importAbsents && convocation.confirmationStatus == 'denied') continue

      if(scout.players.some((p) => p.convocationId == convocation.id)) {
        let player = scout.players.find((p) => p.convocationId == convocation.id)!

        if (params.data.importShirts && !player.shirtId && convocation.teammate.shirts.length > 0) {
          player.shirtId = convocation.teammate.shirts[0].id
          player.shirtNumber = convocation.teammate.shirts[0].number
          player.shirtPrimaryColor = convocation.teammate.shirts[0].primaryColor
          player.shirtSecondaryColor = convocation.teammate.shirts[0].secondaryColor
        }

        if (params.data.importRoles && !player.role) {
          player.role = convocation.teammate.defaultRole
        }

        await player.save()
      } else if(scout.players.some((p) => p.teammateId == convocation.teammateId)) {
        let player = scout.players.find((p) => p.teammateId == convocation.teammateId)!
        
        player.convocationId = convocation.id
        if (params.data.importShirts && !player.shirtId && convocation.teammate.shirts.length) {
          player.shirtId = convocation.teammate.shirts[0].id
          player.shirtNumber = convocation.teammate.shirts[0].number
          player.shirtPrimaryColor = convocation.teammate.shirts[0].primaryColor
          player.shirtSecondaryColor = convocation.teammate.shirts[0].secondaryColor
        }

        if(params.data.importRoles && !player.role) {
          player.role = convocation.teammate.defaultRole
        }

        await player.save()
      } else {
        const playerManager = new PlayersManager()
        await playerManager.create({
          data: {
            scoutId: scout.id,
            convocationId: convocation.id,
            shirtId: params.data.importShirts ? convocation.teammate.shirts[0]?.id : undefined,
            role: params.data.importRoles ? convocation.teammate.defaultRole : undefined
          },
          context: {
            trx,
            user
          }
        })
      }
    }

    return { success: true }
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
        resource: 'scout',
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
      .preload('event', e => 
        e.preload('team')
          .preload('convocations', b => 
            b.preload('teammate', b => 
              b.preload('user')
            )
          )
      )
      .preload('players', b => b
        .preload('convocation')
        .preload('shirt')
        .preload('teammate', b => b.preload('user').preload('shirts'))
      )
      .preload('scoutInfo')
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
      scoringSystemId?: number,
      scoutInfo?: {
        general: ScoutInfoGeneral
      }
    },
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
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

    let scoutInfo = validatedData.scoutInfo
    delete validatedData.scoutInfo

    let scout = await Scout
      .findOrFail(params.data.id, { client: trx })

    scout.merge(validatedData)
    await scout.save()

    if(!!scoutInfo) {
      await scout.related('scoutInfo').updateOrCreate({}, {
        general: params.data.scoutInfo?.general || {}
      }, {
        client: trx
      })
    }

    if (!!scout.scoringSystemId) await scout.load('scoringSystem')
    await scout.load('players')
    await scout.load('scoutInfo')
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
        resource: 'scout',
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

  @withTransaction
  @withUser
  public async studio(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<ScoutStudio> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'scout',
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

    let scout = await this.get({
      data: {
        id: params.data.id
      },
      context: {
        user, trx
      }
    })

    return {
      scout
    }
  }
}