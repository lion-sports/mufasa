import HttpContext from '@ioc:Adonis/Core/HttpContext'
import AuthorizationManager, { Action, Resource } from './authorization.manager'
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import UserModel from 'App/Models/User'
import FilterModifierApplier, { type Modifier } from 'App/services/FilterModifierApplier'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon';

//#region Types
export type Context = {
  user?: {
    id: number
  } | UserModel,
  tenant?: {
    id: number
  },
  tenantId?: number,
  trx?: TransactionClientContract,
}

export type CreateParams<T> = {
  data: T,
  context?: Context
}

export type UpdateParams<T> = {
  data: {
    id: number,
  } & Partial<T>,
  context?: Context
}

export type ListParams = {
  data: {
    page?: number,
    perPage?: number,
    filtersBuilder?: { modifiers: Modifier[] },
    order?: {
      column: string,
      order?: 'desc' | 'asc'
    }[]
  },
  context?: Context
}

export type GetParams = {
  data: {
    id: number
  },
  context?: Context
}

export type DestroyParams = {
  data: {
    id: number,
  },
  context?: Context
}

//#endregion

//#region BaseManager
class BaseManager<T> {
  constructor() {
  }
  protected model: ModelObject
  protected resource: Resource

  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    let trx = params.context?.trx
    await this._withAuth('view', params.context)

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = this.model.query({
      client: trx
    }).where('tenantId', params.context!.tenantId!)

    if (!!params.data.filtersBuilder?.modifiers && params.data.filtersBuilder.modifiers.length > 0) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
    }

    if (!!params.data.order) {
      query.orderBy(params.data.order)
    }

    const results = await query
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: CreateParams<T>): Promise<typeof this.model> {
    let trx = params.context?.trx
    await this._withAuth('manage', params.context)

    let createObj = {
      ...params.data,
      tenantId: params.context?.tenantId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now()
    }

    let createdEntity = await this.model.create(createObj, { client: trx })
    return createdEntity
  }

  @withTransaction
  @withUser
  public async get(params: GetParams): Promise<typeof this.model | null> {
    let trx = params.context?.trx
    await this._withAuth('view', params.context)

    let foundEntity = await this.model.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    return foundEntity
  }

  @withTransaction
  @withUser
  public async update(params: UpdateParams<T>): Promise<typeof this.model> {
    let trx = params.context?.trx
    await this._withAuth('manage', params.context)

    let updatedEntity = await this.model.findOrFail(params.data.id, { client: trx })

    let { id, ...updateParams } = params.data
    updatedEntity.merge({
      ...updateParams,
      updatedAt: DateTime.now()
    })

    let results = await updatedEntity.save()
    return results
  }

  @withTransaction
  @withUser
  public async destroy(params: DestroyParams): Promise<void> {
    let trx = params.context?.trx
    await this._withAuth('manage', params.context)

    let deleteEntity = await this.model.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()
  }

  async _withAuth(action: Action, context?: Context) {
    if (!context) throw new Error('context must be defined')
    let user = context.user as UserModel
    if (!user) throw new Error('user must be defined')

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: action,
        resource: this.resource,
        entities: {}
      },
      context: {
        trx: context.trx
      }
    })
  }
}

export default BaseManager

//#endregion


//#region Decorators
function withUser(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value != 'function')
    throw new Error('withUser decorator can only be used on functions')

  const originalMethod = descriptor.value as Function;

  descriptor.value = async function (...args: any[]) {
    let user: UserModel | undefined | null = null
    if (!!args[0]?.user) {
      user = await UserModel.query().where('id', args[0].user.id).first()
    } else {
      const ctx = HttpContext.get()
      if (!!ctx?.auth?.user) {
        user = await UserModel.query().where('id', ctx?.auth?.user?.id).first()
      }
    }

    if (!user) throw new Error('user must be defined')
    return originalMethod.apply(this, [{ ...args[0], context: { ...args[0].context, user: user } }, ...args.slice(1)])
  }
}

function withTransaction(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = async function (...args: any[]) {
    let trx = args[0]?.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let res = await originalMethod.apply(this, [{ ...args[0], context: { ...args[0].context, trx: trx } }, ...args.slice(1)])

      if (!args[0]?.context?.trx)
        await trx?.commit()
      return res
    } catch (error) {
      if (!args[0]?.context?.trx)
        await trx?.rollback()
      throw error
    }
  }
}

function withAuth(resource: Resource, action: Action, entities?: any) {
  function withAuthDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      let user = args[0]?.context?.user
      if (!user) throw new Error('user must be defined')

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: action,
          resource: resource,
          entities: entities
        },
        context: {
          trx: args[0]?.context?.trx
        }
      })

      return originalMethod.apply(this, args)
    }
  }

  return withAuthDecorator
}

export {
  withUser,
  withTransaction,
  withAuth
}

//#endregion