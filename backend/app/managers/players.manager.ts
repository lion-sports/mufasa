import { Context, withTransaction, withUser } from "./base.manager";
import { validator } from "@ioc:Adonis/Core/Validator"
import User from "App/Models/User";
import AuthorizationManager from "./authorization.manager";
import FilterModifierApplier, { Modifier } from "App/Services/FilterModifierApplier";
import { ModelAttributes, ModelObject } from "@ioc:Adonis/Lucid/Orm";
import Scout from "App/Models/Scout";
import Player, { ScoutEventPlayer } from "App/Models/Player";
import { CreatePlayerValidator, UpdatePlayerValidator } from "App/Validators/players";
import Teammate, { Role } from "App/Models/Teammate";
import Convocation from "App/Models/Convocation";
import Shirt from "App/Models/Shirt";
import Mongo from "App/Services/Mongo";
import { SCOUT_EVENT_COLLECTION_NAME } from "./scout/ScoutEvent";
import { VolleyballScoutEventJson } from "./scout/events/volleyball/VolleyballScoutEvent";

export default class PlayersManager {
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

    let query = Player.query({
        client: trx,
      })
      .select('players.*')
      .preload('convocation')
      .preload('shirt')
      .leftJoin('convocations', 'convocations.id', 'players.convocationId')
      .leftJoin('teammates', 'teammates.id', 'convocations.teammateId')
      .leftJoin('events', 'events.id', 'convocations.eventId')
      .join('teams', b => {
        b.on('events.teamId', 'teams.id').orOn('teammates.teamId', 'teams.id')
      })
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
      scoutId: number
      convocationId?: number
      teammateId?: number
      aliases?: string[]
      shirtId?: number
      role?: Role
      shirtNumber?: number
      shirtPrimaryColor?: string | null
      shirtSecondaryColor?: string | null
      isOpponent?: boolean
    },
    context?: Context
  }): Promise<Player> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
        entities: {
          scout: {
            id: params.data.scoutId
          }
        }
      },
      context: {
        trx
      }
    })

    let validatedData = await validator.validate({
      schema: new CreatePlayerValidator().schema,
      data: params.data
    })

    let scout = await Scout.query({ client: trx })
      .where('id', params.data.scoutId)
      .firstOrFail()

    let shirt: Shirt | undefined = undefined
    if (!!params.data.shirtId) {
      shirt = await Shirt.query({ client: trx })
        .where('id', params.data.shirtId)
        .firstOrFail()
    }

    let teammate: Teammate | undefined | null = undefined
    if(!!params.data.convocationId) {
      let convocation = await Convocation.query({ client: trx })
        .where('id', params.data.convocationId)
        .preload('teammate', b => b.preload('shirts'))
        .firstOrFail()

      teammate = convocation.teammate
    } else if(!!params.data.teammateId) {
      teammate = await Teammate.query({ client: trx })
        .preload('shirts')
        .where('id', params.data.teammateId)
        .first()
    }

    if(!!teammate && !shirt) {
      shirt = teammate.shirts[0]
    }

    let player: Player
    if(!!teammate) {
      player = await Player.updateOrCreate({
          scoutId: scout.id,
          teammateId: teammate?.id,
          convocationId: validatedData.convocationId || null
        }, {
          aliases: validatedData.aliases || [ teammate?.alias || '' ],
          shirtId: shirt?.id,
          shirtNumber: validatedData.shirtNumber || shirt?.number,
          shirtPrimaryColor: validatedData.shirtPrimaryColor || shirt?.primaryColor,
          shirtSecondaryColor: validatedData.shirtSecondaryColor || shirt?.secondaryColor,
          role: validatedData.role || teammate?.defaultRole,
          isOpponent: validatedData.isOpponent
      }, { client: trx })
    } else {
      player = await Player.create({
        scoutId: scout.id,
        aliases: validatedData.aliases || [''],
        shirtId: shirt?.id,
        shirtNumber: validatedData.shirtNumber || shirt?.number,
        shirtPrimaryColor: validatedData.shirtPrimaryColor || shirt?.primaryColor,
        shirtSecondaryColor: validatedData.shirtSecondaryColor || shirt?.secondaryColor,
        role: validatedData.role,
        isOpponent: validatedData.isOpponent
      })
    }

    return player
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Player> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    let player = await Player
      .query({ client: trx })
      .where('id', params.data.id)
      .preload('scout')
      .preload('convocation')
      .preload('teammate')
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'scout',
        entities: {
          scout: {
            id: player.scout.id
          }
        }
      },
      context: {
        trx
      }
    })

    return player
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      aliases?: string[]
      shirtId?: number
      role?: Role
      shirtNumber?: number
      shirtPrimaryColor?: string | null
      shirtSecondaryColor?: string | null
      isOpponent?: boolean
    },
    context?: Context
  }): Promise<Player> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    let player = await Player
      .findOrFail(params.data.id, { client: trx })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
        entities: {
          scout: {
            id: player.scoutId
          }
        }
      },
      context: {
        trx
      }
    })

    let validatedData = await validator.validate({
      schema: new UpdatePlayerValidator().schema,
      data: params.data
    })

    let shirt: Shirt | undefined = undefined
    if(!!validatedData.shirtId) {
      shirt = await Shirt.query({ client: trx })
        .where('id', validatedData.shirtId)
        .firstOrFail()
    }

    let playerData: Partial<ModelAttributes<Player>> = {
      aliases: validatedData.aliases?.filter((a) => a !== undefined),
      role: validatedData.role,
      shirtNumber: validatedData.shirtNumber || shirt?.number,
      shirtPrimaryColor: validatedData.shirtPrimaryColor || shirt?.primaryColor,
      shirtSecondaryColor: validatedData.shirtSecondaryColor || shirt?.secondaryColor
    }

    player.merge(playerData)
    await player.save()

    return player
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

    let player = await Player.query({ client: trx })
      .where('id', params.data.id)
      .first()

    if (!player) return 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
        entities: {
          scout: {
            id: player.scoutId
          }
        }
      },
      context: {
        trx
      }
    })

    await Player.query({ client: trx })
      .where('id', params.data.id)
      .del()
  }

  @withTransaction
  @withUser
  public async lastScoutEvents(params: {
    data: {
      player: {
        id: number
      },
      scout: {
        id: number
      },
      limit?: number
    }
    context?: Context
  }): Promise<VolleyballScoutEventJson[]> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
        entities: {
          scout: {
            id: params.data.scout.id
          }
        }
      },
      context: {
        trx
      }
    })

    await Mongo.init()
    let lastEvents = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<VolleyballScoutEventJson>([
        {
          $match: {
            scoutId: params.data.scout.id,
            $or: [
              { playerId: params.data.player.id },
              { liberoId: params.data.player.id },
            ]
          },
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $limit: params.data.limit || 15
        }
      ])
      .toArray()

    return lastEvents
  }

  @withTransaction
  @withUser
  public async lastScoutEventsForMany(params: {
    data: {
      players: {
        id: number
      }[],
      scout: {
        id: number
      },
      limit?: number
    }
    context?: Context
  }): Promise<Record<number, VolleyballScoutEventJson[]>> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'scout',
        entities: {
          scout: {
            id: params.data.scout.id
          }
        }
      },
      context: {
        trx
      }
    })

    await Mongo.init()
    let lastEvents = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        playerId: number,
        events: VolleyballScoutEventJson[]
      }>([
        {
          $match: {
            scoutId: params.data.scout.id,
            $or: [
              {
                playerId: {
                  $in: params.data.players.map((p) => p.id)
                }
              },
              {
                liberoId: {
                  $in: params.data.players.map((p) => p.id)
                }
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
          $addFields: {
            players: {
              $filter: {
                input: ["$playerId", "$liberoId"],
                as: "id",
                cond: {
                  $ne: ["$$id", null]
                }
              }
            }
          }
        },
        {
          $unwind: {
            path: "$players"
          }
        },
        {
          $group: {
            _id: "$players",
            events: {
              $push: "$$ROOT"
            }
          }
        },
        {
          $project:
          {
            playerId: "$_id",
            events: {
              $firstN: {
                input: "$events",
                n: params.data.limit || 15
              }
            }
          }
        }
      ])
      .toArray()

    let result: Record<number, VolleyballScoutEventJson[]> = {}
    for(let i = 0; i < lastEvents.length; i += 1) {
      result[lastEvents[i].playerId] = lastEvents[i].events
    }
    return result
  }

  public shrinkPlayer(params: {
    data: {
      player: Player | ScoutEventPlayer
    }
  }): ScoutEventPlayer {
    return {
      id: params.data.player.id,
      convocationId: params.data.player.convocationId,
      teammate: {
        alias: params.data.player.teammate?.alias,
        user: {
          firstname: params.data.player.teammate?.user?.firstname,
          lastname: params.data.player.teammate?.user?.lastname
        }
      },
      scoutId: params.data.player.scoutId,
      teammateId: params.data.player.teammateId,
      aliases: params.data.player.aliases,
      role: params.data.player.role,
      shirtId: params.data.player.shirtId,
      shirtNumber: params.data.player.shirtNumber,
      shirtPrimaryColor: params.data.player.shirtPrimaryColor,
      shirtSecondaryColor: params.data.player.shirtSecondaryColor,
      isOpponent: params.data.player.isOpponent
    }
  }
}