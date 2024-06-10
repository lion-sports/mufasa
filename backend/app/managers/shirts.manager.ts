import Shirt from "App/Models/Shirt";
import { Context, withTransaction, withUser } from "./base.manager";
import { CreateShirtValidator, UpdateShirtValidator } from "App/Validators/shirts";
import { validator } from "@ioc:Adonis/Core/Validator"
import User from "App/Models/User";
import AuthorizationManager from "./authorization.manager";
import FilterModifierApplier, { Modifier } from "App/Services/FilterModifierApplier";
import { ModelObject } from "@ioc:Adonis/Lucid/Orm";

export default class ShirtManager {
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

    let query = Shirt.query({
        client: trx,
      })
      .select('shirts.*')
      .preload('teammate')
      .join('teammates', 'teammates.id', 'shirts.teammateId')
      .join('teams', 'teammates.teamId', 'teams.id')
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
      number: number
      name?: string
      primaryColor?: string
      secondaryColor?: string
      teammateId: number
    },
    context?: Context
  }): Promise<Shirt> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'create',
        resource: 'shirt',
        entities: {
          teammate: {
            id: params.data.teammateId
          }
        }
      },
      context: {
        trx
      }
    })

    let validatedData = await validator.validate({
      schema: new CreateShirtValidator().schema,
      data: params.data
    })

    let shirt = await Shirt.create(validatedData, { client: trx })

    await shirt.load('teammate')
    return shirt
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Shirt> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'shirt',
        entities: {
          shirt: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    let shirt = await Shirt
      .query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    return shirt
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      number?: number
      name?: string
      primaryColor?: string
      secondaryColor?: string
      teammateId?: number
    },
    context?: Context
  }): Promise<Shirt> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'update',
        resource: 'shirt',
        entities: {
          shirt: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    let validatedData = await validator.validate({
      schema: new UpdateShirtValidator().schema,
      data: params.data
    })

    let shirt = await Shirt
      .findOrFail(params.data.id, { client: trx })

    shirt.merge(validatedData)
    await shirt.save()

    return shirt
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
        action: 'destroy',
        resource: 'shirt',
        entities: {
          shirt: {
            id: params.data.id
          }
        }
      },
      context: {
        trx
      }
    })

    await Shirt.query({ client: trx }).where('id', params.data.id).del()
  }
}