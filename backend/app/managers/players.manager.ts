import { Context, withTransaction, withUser } from "./base.manager";
import { validator } from "@ioc:Adonis/Core/Validator"
import User from "App/Models/User";
import AuthorizationManager from "./authorization.manager";
import FilterModifierApplier, { Modifier } from "App/Services/FilterModifierApplier";
import { ModelAttributes, ModelObject } from "@ioc:Adonis/Lucid/Orm";
import Scout from "App/Models/Scout";
import Player from "App/Models/Player";
import { CreatePlayerValidator, UpdatePlayerValidator } from "App/Validators/players";
import Teammate from "App/Models/Teammate";
import Convocation from "App/Models/Convocation";
import Shirt from "App/Models/Shirt";

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
      convocationId: number
      teammateId: number
      aliases: string[]
      shirtId: number
    },
    context?: Context
  }): Promise<Player> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'manage',
        resource: 'Scout',
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
        .preload('teammate')
        .firstOrFail()

      teammate = convocation.teammate
    } else if(!!params.data.teammateId) {
      teammate = await Teammate.query({ client: trx })
        .where('id', params.data.teammateId)
        .first()
    }

    if(!teammate) throw new Error('no teammate defined')   

    // TODO check if a player already exists for a teammate

    let player = await Player.create({
      scoutId: scout.id,
      teammateId: teammate.id,
      convocationId: params.data.convocationId,
      aliases: params.data.aliases || [teammate.alias],
      shirtId: shirt?.id,
      shirtNumber: shirt?.number,
      shirtPrimaryColor: shirt?.primaryColor,
      shirtSecondaryColor: shirt?.secondaryColor
    }, { client: trx })

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
        resource: 'Scout',
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
      aliases?: string[],
      shirtId?: number
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
        resource: 'Scout',
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

    let playerData: Partial<ModelAttributes<Player>> = {
      aliases: validatedData.aliases
    }

    if(!!validatedData.shirtId) {
      let shirt = await Shirt.query({ client: trx })
        .where('id', validatedData.shirtId)
        .firstOrFail()

      playerData.shirtId = shirt.id
      playerData.shirtNumber = shirt.number
      playerData.shirtPrimaryColor = shirt.primaryColor
      playerData.shirtSecondaryColor = shirt.secondaryColor
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
        resource: 'Scout',
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
}