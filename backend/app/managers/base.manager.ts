import HttpContext from '@ioc:Adonis/Core/HttpContext'
import AuthorizationManager, { Action, Resource } from './authorization.manager'
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import FilterModifierApplier, { type Modifier } from 'App/Services/FilterModifierApplier'
import {
  LucidModel,
  ModelAttributes,
  ModelObject,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

//#region Types
export type Context = {
  user?:
  | {
    id: number
  }
  | User
  trx?: TransactionClientContract
}

export type CreateParams<T> = {
  data: T
  context?: Context
}

export type UpdateParams<T> = {
  data: {
    id: number
  } & Partial<T>
  context?: Context
}

export type ListParams = {
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
}

export type GetParams = {
  data: {
    id: number
  }
  context?: Context
}

export type DestroyParams = {
  data: {
    id: number
  }
  context?: Context
}

//#endregion

//#region BaseManager
class BaseManager<
  Model extends LucidModel, 
  ClassResource extends Resource, 
  CreateData, 
  UpdateData = CreateData
> {
  constructor() { }

  protected model: Model
  protected resource: ClassResource
  protected actions: {
    list: Action<ClassResource>
    create: Action<ClassResource>
    get: Action<ClassResource>
    update: Action<ClassResource>
    destroy: Action<ClassResource>
  }

  protected auth?: (params: {
    id?: number
    data: any
    user: User
    method: 'create' | 'update' | 'list' | 'get' | 'destroy'
    context?: Context
  }) => Promise<void>

  protected validate?: (params: {
    data: any
    method: 'create' | 'update'
    context?: Context
  }) => Promise<void>

  protected query?: (params: {
    query: ModelQueryBuilderContract<Model>
    method: 'list' | 'get'
    user: User
    context?: Context
  }) => ModelQueryBuilderContract<Model>

  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[]; meta: any }> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!!this.auth)
      await this.auth({
        user,
        method: 'list',
        data: params.data,
        context: {
          user,
          trx,
          ...params.context,
        },
      })
    else await this._withAuth(this.resource, this.actions['list'], params.context)

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = this.model.query({
      client: trx,
    })

    if (!!params.data.filtersBuilder) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
    }

    if (!!params.data.order) {
      query.orderBy(params.data.order)
    }

    if (!!this.query) {
      query = this.query({
        query,
        method: 'list',
        user,
      })
    }

    const results = await query.paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: CreateParams<CreateData>): Promise<InstanceType<Model>> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!!this.auth)
      await this.auth({
        user,
        method: 'create',
        data: params.data,
        context: {
          user,
          trx,
          ...params.context,
        },
      })
    else await this._withAuth(this.resource, this.actions['create'], params.context)

    if (!!this.validate) await this.validate({ data: params.data, method: 'create' })

    let createObj = {
      ...params.data,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    } as Partial<ModelAttributes<InstanceType<Model>>>

    let createdEntity = await this.model.create(createObj, { client: trx })
    return createdEntity
  }

  @withTransaction
  @withUser
  public async get(params: GetParams): Promise<InstanceType<Model> | null> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!!this.auth)
      await this.auth({
        id: params.data.id,
        user,
        data: params.data,
        method: 'get',
        context: {
          user,
          trx,
          ...params.context,
        },
      })
    else await this._withAuth(this.resource, this.actions['get'], params.context)

    let query = this.model.query({ client: trx }).where('id', params.data.id)

    if (!!this.query) {
      query = this.query({
        query,
        method: 'get',
        user,
      })
    }

    let foundEntity = await query.firstOrFail()

    return foundEntity
  }

  @withTransaction
  @withUser
  public async update(params: UpdateParams<UpdateData>): Promise<InstanceType<Model>> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!!this.auth)
      await this.auth({
        id: params.data.id,
        user,
        data: params.data,
        method: 'update',
        context: {
          user,
          trx,
          ...params.context,
        },
      })
    else await this._withAuth(this.resource, this.actions['update'], params.context)

    if (!!this.validate) await this.validate({ data: params.data, method: 'update' })

    let updatedEntity = await this.model.findOrFail(params.data.id, { client: trx })

    let { id, ...updateParams } = params.data
    let up: any = updateParams
    updatedEntity.merge({
      ...up,
    })

    let results = await updatedEntity.save()
    return results
  }

  @withTransaction
  @withUser
  public async destroy(params: DestroyParams): Promise<void> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!!this.auth)
      await this.auth({
        id: params.data.id,
        user,
        data: params.data,
        method: 'destroy',
        context: {
          user,
          trx,
          ...params.context,
        },
      })
    else await this._withAuth(this.resource, this.actions['destroy'], params.context)

    await this.model.query({ client: trx }).where('id', params.data.id).del()
  }

  protected async _withAuth<R extends Resource>(resource: R, action: Action<R>, context?: Context) {
    if (!context) throw new Error('context must be defined')
    let user = context.user as User
    if (!user) throw new Error('user must be defined')

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: action,
        resource: resource,
        entities: {},
      },
      context: {
        trx: context.trx,
      },
    })
  }
}

export default BaseManager

//#endregion

//#region Decorators
function withUser(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value != 'function')
    throw new Error('withUser decorator can only be used on functions')

  const originalMethod = descriptor.value as Function

  descriptor.value = async function (...args: any[]) {
    let user: User | undefined | null = null
    
    if (!!args[0]?.context?.user) {
      user = await User.query().where('id', args[0]?.context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      if (!!ctx?.auth?.user) {
        user = await User.query().where('id', ctx?.auth?.user?.id).first()
      }
    }

    if (!user) throw new Error('user must be defined')
    return originalMethod.apply(this, [
      { ...args[0], context: { ...args[0].context, user: user } },
      ...args.slice(1),
    ])
  }
}

function withTransaction(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = async function (...args: any[]) {
    let trx = args[0]?.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let res = await originalMethod.apply(this, [
        {
          ...(!!args[0] ? args[0] : {}),
          context: { ...(!!args[0] ? args[0].context : {}), trx: trx },
        },
        ...args.slice(1),
      ])

      if (!args[0]?.context?.trx) await trx?.commit()
      return res
    } catch (error) {
      if (!args[0]?.context?.trx) await trx?.rollback()
      throw error
    }
  }
}

function withAuth<R extends Resource>(resource: R, action: Action<R>, entities?: any) {
  function withAuthDecorator(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      let user = args[0]?.context?.user
      if (!user) throw new Error('user must be defined')

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: action,
          resource: resource,
          entities: entities,
        },
        context: {
          trx: args[0]?.context?.trx,
        },
      })

      return originalMethod.apply(this, args)
    }
  }

  return withAuthDecorator
}

export { withUser, withTransaction, withAuth }

//#endregion
