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
import { ScoutInfoGeneral, ScoutInfoSettings } from "App/Models/ScoutInfo";
import Mongo from "App/Services/Mongo";
import { SCOUT_EVENT_COLLECTION_NAME } from "./ScoutEvent";
import { FIRST_POINT, VolleyballPlayersPosition, VolleyballPoints } from "./events/volleyball/common";
import TeamRotationScoutEvent from "./events/volleyball/TeamRotationScoutEvent";
import { TimeoutScoutEventJson } from "./events/volleyball/TimeoutScoutEvent";
import { PlayerSubstitutionScoutEventJson } from "./events/volleyball/PlayerSubstitutionScoutEvent";
import { ScoutEventPlayer } from "App/Models/Player";
import scoutsSocket from "./scouts.socket";
import { ManualPhaseScoutEventJson } from "./events/volleyball/ManualPhaseScoutEvent";
import { LiberoSubstitutionScoutEventJson } from "./events/volleyball/LiberoSubstitutionScoutEvent";
import { VolleyballScoutEventJson } from "./events/volleyball/VolleyballScoutEvent";
import { ReceiveScoutEventResult } from "./events/volleyball/ReceiveScoutEvent";
import excelJS from 'exceljs'
import { lastPlayerPositionAggregation } from "./aggregations/lastPlayerPosition.aggregation";
import { totalAnalysis } from "./aggregations/totalAnalysis.aggregation";
import TeammatesManager from "../teammates.manager";
import { TransactionClientContract } from "@ioc:Adonis/Lucid/Database";

export type ScoutStudio = {
  scout: Scout,
  selectedPlayer?: ScoutEventPlayer,
  lastEventsForPlayers?: Record<number, VolleyballScoutEventJson[]>,
  analysis?: ScoutAnalysis
}

export type ScoutAnalysis = {
  pointsMade: {
    player: ScoutEventPlayer,
    pointsMade: number,
    category: 'block' | 'serve' | 'spike'
  }[],
  errorsMade: {
    player: ScoutEventPlayer,
    errorsMade: number,
    category: 'block' | 'serve' | 'spike'
  }[],
  total: {
    player: ScoutEventPlayer,
    stats: SummarizedPlayerStats
  }[],
  receiveOverTimeByPlayer: {
    player: ScoutEventPlayer,
    result: ReceiveScoutEventResult,
    points: VolleyballPoints,
    sortPointIndex: number
    resultValue: number
  }[]
}

export type SummarizedPlayerStats = {
  block: {
    handsOut: number
    point: number
    touch: number
    putBack: number
  },
  receive: {
    '++': number
    '+': number
    '-': number
    '/': number
    'x': number
  },
  serve: {
    error: number
    point: number
    received: number
  },
  spike: {
    error: number
    point: number
    defense: number
  }
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
      general: scoutInfo?.general || {},
      settings: scoutInfo?.settings || {}
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
        .orderBy(['players.shirtNumber', 'players.createdAt'])
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
        general?: ScoutInfoGeneral,
        settings?: ScoutInfoSettings
      }
    },
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx as TransactionClientContract
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
      let existingScoutInfo = await scout.related('scoutInfo').firstOrCreate(
        { },
        { },
        { client: trx }
      )

      let ObjectAssign = (target, ...sources) => {
        sources.forEach(source => {
          Object.keys(source).forEach(key => {
            if(!target) target = {}

            const s_val = source[key]
            const t_val = target[key]
            target[key] = t_val && s_val && typeof t_val === 'object' && typeof s_val === 'object'
              ? ObjectAssign(t_val, s_val)
              : s_val
          })
        })
        return target
      }

      console.log(ObjectAssign(existingScoutInfo.settings, (scoutInfo.settings || {})))
      
      existingScoutInfo.general = ObjectAssign(existingScoutInfo.general, (scoutInfo.general || {}))
      existingScoutInfo.settings = ObjectAssign(existingScoutInfo.settings, (scoutInfo.settings || {}))
      await existingScoutInfo.useTransaction(trx).save()
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

    await Mongo.init()

    let query: any = { scoutId: params.data.id }

    await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .deleteMany(
        query
      )
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

    let lastEventsForPlayers: ScoutStudio['lastEventsForPlayers'] = {}
    if(!!scout.players) {
      let playersManager = new PlayersManager()

      lastEventsForPlayers = await playersManager.lastScoutEventsForMany({
        data: {
          players: scout.players,
          scout: scout
        },
        context: {
          user, trx
        }
      })
    }

    let analysis = await this.analysis({
      data: {
        id: scout.id
      },
      context: {
        user, trx
      }
    })

    return {
      scout,
      lastEventsForPlayers,
      analysis
    }
  }

  @withTransaction
  @withUser
  public async recalculateStash(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<Scout> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    let scout = await Scout.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    await Mongo.init()


    let lastPoint = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        newPoints: VolleyballPoints
      }>([
        {
          $match: {
            scoutId: params.data.id,
            type: 'pointScored'
          },
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $limit: 1
        }
      ])
      .toArray()

    if(!scout.stash) scout.stash = {}
    if(lastPoint.length != 0) {
      scout.stash.points = lastPoint[0].newPoints
    } else {
      scout.stash.points = FIRST_POINT
    }

    let lastPositionsEvent = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        _id: [string, boolean],
        player: ScoutEventPlayer
      }>(
        lastPlayerPositionAggregation({
          scout
        })  
      )
      .toArray()

    let lastPositionFound: VolleyballPlayersPosition | undefined = undefined
    if (lastPositionsEvent.length > 0) {
      lastPositionFound = {
        enemy: {},
        friends: {}
      }

      for (let i = 0; i < lastPositionsEvent.length; i += 1) {
        let event = lastPositionsEvent[i]
        let position = event._id[0]
        let isOpponent = event._id[1]
  
        if(isOpponent) lastPositionFound.enemy[position] = {
          player: event.player
        }
        else lastPositionFound.friends[position] = {
          player: event.player
        }
      }
    } else lastPositionFound = {
      enemy: {},
      friends: {}
    }
    
    if(!!lastPositionFound) {
      let positions = TeamRotationScoutEvent.getPlayersPositions({
        positions: lastPositionFound
      })

      scout.stash.playersDefenseBreakPositions = positions.playersDefenseBreakPositions
      scout.stash.playersDefenseSideOutPositions = positions.playersDefenseSideoutPositions
      scout.stash.playersReceivePositions = positions.playersReceivePositions
      scout.stash.playersServePositions = positions.playersServePositions
    }

    let lastsTimeoutsEvents = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<TimeoutScoutEventJson>([
        {
          $match: {
            scoutId: params.data.id,
            type: 'timeout',
            $and: [
              { 'points.friends.sets': scout.stash.points.friends.sets },
              { 'points.enemy.sets': scout.stash.points.enemy.sets },
            ]
          },
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $limit: 1
        }
      ])
      .toArray()

    scout.stash.currentSetTimeoutsCalled = {
      enemy: lastsTimeoutsEvents.filter((e) => e.opponent).length,
      friends: lastsTimeoutsEvents.filter((e) => !e.opponent).length
    }

    let lastsSubstitutionsEvents = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<PlayerSubstitutionScoutEventJson>([
        {
          $match: {
            scoutId: params.data.id,
            type: 'playerSubstitution',
            $and: [
              { 'points.friends.sets': scout.stash.points.friends.sets },
              { 'points.enemy.sets': scout.stash.points.enemy.sets },
            ]
          },
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $limit: 1
        }
      ])
      .toArray()

    scout.stash.currentSetSubstitutionsMade = {
      friends: lastsSubstitutionsEvents.filter((lse) => !lse.playerIsOpponent).map((lse) => ({
        playerIn: lse.playerIn,
        playerOut: lse.player
      })),
      enemy: lastsSubstitutionsEvents.filter((lse) => lse.playerIsOpponent).map((lse) => ({
        playerIn: lse.playerIn,
        playerOut: lse.player
      }))
    }

    let openLiberoSubstitutions = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        number: number
        substitution: LiberoSubstitutionScoutEventJson
      }>([
        {
          $match: {
            scoutId: params.data.id,
            type: 'liberoSubstitution',
            $and: [
              { 'points.friends.sets': scout.stash.points.friends.sets },
              { 'points.enemy.sets': scout.stash.points.enemy.sets },
            ]
          },
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $addFields: {
            liberoSubKey: {
              $concat: [
                {
                  $toString: "$liberoId"
                },
                "_",
                {
                  $toString: "$playerId"
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$liberoSubKey",
            number: {
              $count: {}
            },
            substitution: {
              $last: "$$ROOT"
            }
          }
        },
        {
          $match: {
            number: {
              $mod: [2, 1]
            }
          }
        }
      ])
      .toArray()

    scout.stash.currentSetOpenLiberoSubstitution = openLiberoSubstitutions.map((e) => e.substitution)

    let lastManualPhaseEvent = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<ManualPhaseScoutEventJson>([
        {
          $match: {
            scoutId: params.data.id,
            type: 'manualPhase',
            $and: [
              { 'points.friends.sets': scout.stash.points.friends.sets },
              { 'points.enemy.sets': scout.stash.points.enemy.sets },
            ]
          },
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $limit: 1
        }
      ])
      .toArray()

    scout.stash.phase = lastManualPhaseEvent[0]?.phase

    await scout.save()

    await scoutsSocket.emit({
      data: {
        event: 'scout:stashReload',
        data: {
          scout
        }
      },
      context: {
        trx
      }
    })
    return scout
  }

  @withTransaction
  @withUser
  public async undo(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<Scout> {
    await Mongo.init()

    let query: any = { scoutId: params.data.id }

    if(!!params.context?.user) {
      query.createdByUserId = params.context?.user?.id
    }

    await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .findOneAndDelete(
        query, { sort: { date: -1 } }
      )

    let scout = await this.recalculateStash({
      data: params.data,
      context: {
        ...params.context
      }
    })

    return scout
  }

  @withTransaction
  @withUser
  public async restart(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<Scout> {
    await Mongo.init()

    await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .deleteMany(
        { scoutId: params.data.id }
      )

    let scout = await Scout
      .query({ client: params.context?.trx })
      .where('id', params.data.id)
      .firstOrFail()

    scout.stash = {}
    await scout.save()

    await scoutsSocket.emit({
      data: {
        event: 'scout:stashReload',
        data: {
          scout
        }
      },
      context: params.context
    })

    return scout
  }

  @withTransaction
  @withUser
  public async analysis(params: {
    data: {
      id: number,
      playerId?: number,
      set?: number
    },
    context?: Context
  }): Promise<ScoutAnalysis> {
    await Mongo.init()

    let matchScoutAndPlayerQuery: any = {
      $match: {
        scoutId: params.data.id,
      }
    }

    if(!!params.data.playerId) {
      matchScoutAndPlayerQuery['$match'].playerId = params.data.playerId
    }

    if (!!params.data.set) {
      if(params.data.set == 1) {
        matchScoutAndPlayerQuery['$match']['$or'] = [
          {
            $and: [
              { 'points.friends.sets': 0 },
              { 'points.enemy.sets': 0 },
            ]
          }
        ]
      } else if(params.data.set == 2) {
        matchScoutAndPlayerQuery['$match']['$or'] = [
          {
            $and: [
              { 'points.friends.sets': 1 },
              { 'points.enemy.sets': 0 },
            ]
          },
          {
            $and: [
              { 'points.friends.sets': 0 },
              { 'points.enemy.sets': 1 },
            ]
          }
        ]
      } else if (params.data.set == 3) {
        matchScoutAndPlayerQuery['$match']['$or'] = [
          {
            $and: [
              { 'points.friends.sets': 2 },
              { 'points.enemy.sets': 0 },
            ]
          },
          {
            $and: [
              { 'points.friends.sets': 0 },
              { 'points.enemy.sets': 2 },
            ]
          },
          {
            $and: [
              { 'points.friends.sets': 1 },
              { 'points.enemy.sets': 1 },
            ]
          }
        ]
      } else if (params.data.set == 4) {
        matchScoutAndPlayerQuery['$match']['$or'] = [
          {
            $and: [
              { 'points.friends.sets': 2 },
              { 'points.enemy.sets': 1 },
            ]
          },
          {
            $and: [
              { 'points.friends.sets': 1 },
              { 'points.enemy.sets': 2 },
            ]
          },
        ]
      } else if (params.data.set == 5) {
        matchScoutAndPlayerQuery['$match']['$or'] = [
          {
            $and: [
              { 'points.friends.sets': 2 },
              { 'points.enemy.sets': 2 },
            ]
          }
        ]
      }
    }

    let pointsMade = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer,
        pointsMade: number,
        category: 'block' | 'serve' | 'spike'
      }>([
        matchScoutAndPlayerQuery,
        {
          $match:
          {
            $or: [
              {
                type: "block",
                result: "point"
              },
              {
                type: "spike",
                result: "point"
              },
              {
                type: "serve",
                result: "point"
              }
            ]
          }
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $group: {
            _id: ["$playerId", "$type"],
            player: {
              $last: "$player"
            },
            pointsMade: {
              $count: {}
            },
            category: {
              $last: "$type"
            }
          }
        }
      ])
      .toArray()

    let errorsMade = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer,
        errorsMade: number,
        category: 'block' | 'serve' | 'spike'
      }>([
        matchScoutAndPlayerQuery,
        {
          $match:
          {
            $or: [
              {
                type: "block",
                result: "error"
              },
              {
                type: "spike",
                result: "error"
              },
              {
                type: "serve",
                result: "error"
              }
            ]
          }
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $group: {
            _id: ["$playerId", "$type"],
            player: {
              $last: "$player"
            },
            errorsMade: {
              $count: {}
            },
            category: {
              $last: "$type"
            }
          }
        }
      ])
      .toArray()

    let receiveOverTimeByPlayer = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer
        result: ReceiveScoutEventResult
        points: VolleyballPoints
        sortPointIndex: number
        resultValue: number
      }>([
        matchScoutAndPlayerQuery,
        {
          $match: {
            type: 'receive'
          }
        },
        {
          $addFields: {
            sortPointIndex: {
              $add: [
                {
                  $add: [
                    "$points.enemy.points",
                    "$points.friends.points"
                  ]
                },
                {
                  $multiply: [
                    {
                      $add: [
                        "$points.enemy.sets",
                        "$points.friends.sets"
                      ]
                    },
                    100
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: {
            sortPointIndex: 1
          }
        },
        {
          $project: {
            result: "$result",
            player: "$player",
            points: "$points",
            sortPointIndex: "$sortPointIndex",
            resultValue: {
              $cond: [{ $eq: ["$result", "x"] }, 0, {
                $cond: [{ $eq: ["$result", "/"] }, 1, {
                  $cond: [{ $eq: ["$result", "-"] }, 2, {
                    $cond: [{ $eq: ["$result", "+"] }, 3, {
                      $cond: [{ $eq: ["$result", "++"] }, 4, -1]
                    }]
                  }]
                }]
              }]
            }
          }
        }
      ])
      .toArray()

    let total = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer,
        stats: SummarizedPlayerStats
      }>([
        matchScoutAndPlayerQuery,
        ...totalAnalysis()
      ])
      .toArray()

    return {
      pointsMade,
      errorsMade,
      receiveOverTimeByPlayer,
      total
    }
  }

  @withTransaction
  @withUser
  public async getFirstSetStartingSix(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<VolleyballPlayersPosition> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    let scout = await Scout.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    await Mongo.init()

    let lastPositionsEvent = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        _id: [string, boolean],
        player: ScoutEventPlayer
      }>(
        [
          {
            $match: {
              type: "playerInPosition",
              scoutId: scout.id,
              $and: [
                { 'points.friends.sets': 0 },
                { 'points.enemy.sets': 0 },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $group: {
              _id: [
                {
                  $toString: "$position"
                },
                "$playerIsOpponent"
              ],
              player: {
                $last: "$player"
              }
            }
          },
          {
            $match:
            {
              player: {
                $ne: null
              }
            }
          }
        ]
      )
      .toArray()

    let lastPositionFound: VolleyballPlayersPosition | undefined = undefined

    if (lastPositionsEvent.length > 0) {
      lastPositionFound = {
        enemy: {},
        friends: {}
      }

      for (let i = 0; i < lastPositionsEvent.length; i += 1) {
        let event = lastPositionsEvent[i]
        let position = event._id[0]
        let isOpponent = event._id[1]

        if (isOpponent) lastPositionFound.enemy[position] = {
          player: event.player
        }
        else lastPositionFound.friends[position] = {
          player: event.player
        }
      }
    } else lastPositionFound = {
      enemy: {},
      friends: {}
    }

    return lastPositionFound
  }
}