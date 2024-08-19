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
import Mongo from "App/Services/Mongo";
import { SCOUT_EVENT_COLLECTION_NAME } from "./ScoutEvent";
import { FIRST_POINT, VolleyballPlayersPosition, VolleyballPoints, VolleyballScoutEventPosition } from "./events/volleyball/common";
import TeamRotationScoutEvent, { TeamRotationScoutEventJson } from "./events/volleyball/TeamRotationScoutEvent";
import { TimeoutScoutEventJson } from "./events/volleyball/TimeoutScoutEvent";
import PlayerSubstitutionScoutEvent, { PlayerSubstitutionScoutEventJson } from "./events/volleyball/PlayerSubstitutionScoutEvent";
import PlayerInPositionScoutEvent, { PlayerInPositionScoutEventJson } from "./events/volleyball/PlayerInPositionScoutEvent";
import { ScoutEventPlayer } from "App/Models/Player";
import scoutsSocket from "./scouts.socket";
import { ManualPhaseScoutEventJson } from "./events/volleyball/ManualPhaseScoutEvent";
import { LiberoSubstitutionScoutEventJson } from "./events/volleyball/LiberoSubstitutionScoutEvent";

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
        [
          {
            $match: {
              cond: false
            }
          },
          {
            $unionWith: {
              coll: SCOUT_EVENT_COLLECTION_NAME,
              pipeline: [
                {
                  $match: {
                    type: "teamRotation",
                    scoutId: params.data.id,
                    $and: [
                      { 'points.friends.sets': scout.stash.points.friends.sets },
                      { 'points.enemy.sets': scout.stash.points.enemy.sets },
                    ]
                  }
                },
                {
                  $sort: {
                    date: 1
                  }
                },
                {
                  $project: {
                    friendsPlayersFromRotation: {
                      $objectToArray:
                        "$newPositions.friends"
                    },
                    date: "$date",
                    type: "teamRotation"
                  }
                },
                {
                  $unwind: {
                    path: "$friendsPlayersFromRotation"
                  }
                },
                {
                  $group: {
                    _id: [
                      "$friendsPlayersFromRotation.k",
                      "$friendsPlayersFromRotation.v.player.isOpponent"
                    ],
                    lastPlayer: {
                      $last:
                        "$friendsPlayersFromRotation.v.player"
                    },
                    lastDate: {
                      $last: "$date"
                    },
                    type: {
                      $last: "$type"
                    }
                  }
                }
              ]
            }
          },
          {
            $unionWith: {
              coll: SCOUT_EVENT_COLLECTION_NAME,
              pipeline: [
                {
                  $match: {
                    type: "teamRotation",
                    scoutId: params.data.id,
                    $and: [
                      { 'points.friends.sets': scout.stash.points.friends.sets },
                      { 'points.enemy.sets': scout.stash.points.enemy.sets },
                    ]
                  }
                },
                {
                  $sort: {
                    date: 1
                  }
                },
                {
                  $project: {
                    enemyPlayersFromRotation: {
                      $objectToArray:
                        "$newPositions.enemy"
                    },
                    date: "$date",
                    type: "teamRotation"
                  }
                },
                {
                  $unwind: {
                    path: "$enemyPlayersFromRotation"
                  }
                },
                {
                  $group: {
                    _id: [
                      "$enemyPlayersFromRotation.k",
                      "$enemyPlayersFromRotation.v.player.isOpponent"
                    ],
                    lastPlayer: {
                      $last: "$enemyPlayersFromRotation.v.player"
                    },
                    lastDate: {
                      $last: "$date"
                    },
                    type: {
                      $last: "$type"
                    }
                  }
                }
              ]
            }
          },
          {
            $unionWith:
            {
              coll: SCOUT_EVENT_COLLECTION_NAME,
              pipeline: [
                {
                  $match: {
                    type: "playerInPosition",
                    scoutId: params.data.id,
                    $and: [
                      { 'points.friends.sets': scout.stash.points.friends.sets },
                      { 'points.enemy.sets': scout.stash.points.enemy.sets },
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
                    lastPlayer: {
                      $last: "$player"
                    },
                    lastDate: {
                      $last: "$date"
                    },
                    type: {
                      $last: "$type"
                    }
                  }
                }
              ]
            }
          },
          {
            $unionWith:
            {
              coll: SCOUT_EVENT_COLLECTION_NAME,
              pipeline: [
                {
                  $match: {
                    type: "playerSubstitution",
                    scoutId: params.data.id,
                    $and: [
                      { 'points.friends.sets': scout.stash.points.friends.sets },
                      { 'points.enemy.sets': scout.stash.points.enemy.sets },
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
                    lastPlayer: {
                      $last: "$playerIn"
                    },
                    lastDate: {
                      $last: "$date"
                    },
                    type: {
                      $last: "$type"
                    }
                  }
                }
              ]
            }
          },
          {
            $unionWith: {
              coll: SCOUT_EVENT_COLLECTION_NAME,
              pipeline: [
                {
                  $match: {
                    type: "liberoSubstitution",
                    inOrOut: "in",
                    scoutId: params.data.id,
                    $and: [
                      { 'points.friends.sets': scout.stash.points.friends.sets },
                      { 'points.enemy.sets': scout.stash.points.enemy.sets },
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
                      "$opponent"
                    ],
                    lastPlayer: {
                      $last: "$libero"
                    },
                    lastDate: {
                      $last: "$date"
                    },
                    type: {
                      $last: "$type"
                    }
                  }
                }
              ]
            }
          },
          {
            $unionWith: {
              coll: SCOUT_EVENT_COLLECTION_NAME,
              pipeline: [
                {
                  $match: {
                    type: "liberoSubstitution",
                    inOrOut: "out",
                    scoutId: params.data.id,
                    $and: [
                      { 'points.friends.sets': scout.stash.points.friends.sets },
                      { 'points.enemy.sets': scout.stash.points.enemy.sets },
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
                      "$opponent"
                    ],
                    lastPlayer: {
                      $last: "$player"
                    },
                    lastDate: {
                      $last: "$date"
                    },
                    type: {
                      $last: "$type"
                    }
                  }
                }
              ]
            }
          },
          {
            $sort:
            {
              lastDate: 1
            }
          },
          {
            $group:
            {
              _id: "$_id",
              player: {
                $last: "$lastPlayer"
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

    let result = await Mongo.db
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
}