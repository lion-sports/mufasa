import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import EventSessionModel from 'App/Models/EventSession'
import UserModel from 'App/Models/User';
import type EventSession from 'App/Models/EventSession'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import HttpContext from '@ioc:Adonis/Core/HttpContext'

export type Context = {
  user?: {
    id: number
  },
  trx?: TransactionClientContract
}

export type CreateParams = {
  data: {
    name: string,
  },
  context?: Context
}

export type UpdateParams = {
  data: {
    id: number,
    name?: string,
  },
  context?: Context
}

export type ListParams = {
  data: {
    page?: number,
    perPage?: number
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
    id: number
  },
  context?: Context
}

export default class EventSessionManager {
  constructor() {
  }

  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    const user = await this._getUserFromContext(params.context)
    let query = EventSessionModel
      .query()

    if(!!user) {
      query = query.whereHas('ownedBy', builder => builder.where('users.id', user.id))
    }

    const results = await query
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  public async create(params: CreateParams): Promise<EventSession> {
    const user = await this._getUserFromContext(params.context)
    if(!user) throw new Error('user must be defined to create an event session')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      if(!params.data.name) throw new Error('name is not defined')

      const createdEventSession = await EventSessionModel.create(params.data, {
        client: trx
      })

      await createdEventSession.related('ownedBy').associate(user)

      if (!params.context?.trx) await trx.commit()
      return createdEventSession
    } catch(error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async get(params: GetParams): Promise<ModelObject> {
    const user = await this._getUserFromContext(params.context)
    let query = EventSessionModel
      .query({
        client: params.context?.trx
      });

    if (!!user) {
      query = query.whereHas('ownedBy', builder => builder.where('users.id', user.id))
    }

    const results = await query.where('id', params.data.id)

    return results[0]
  }

  public async update(params: UpdateParams): Promise<EventSession> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to update an event session')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      if(!params.data.id) throw new Error('id must be defined')

      const eventSession = await EventSessionModel
        .query({ client: trx })
        .where('id', params.data.id)
        .whereHas('ownedBy', builder => builder.where('users.id', user.id))
        .firstOrFail()

      eventSession.merge({
        name: params.data.name,
      })

      const results = await eventSession.save()
      if (!params.context?.trx) await trx.commit()
      return results
    } catch(error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async destroy(params: DestroyParams): Promise<void> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to update an event session')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      if(!params.data.id) throw new Error("id must be defined");

      let eventSession = await EventSessionModel.query({ client: trx })
        .where('id', params.data.id)
        .whereHas('ownedBy', builder => builder.where('users.id', user.id))
        .firstOrFail()

      await eventSession.delete()
      if (!params.context?.trx) await trx.commit()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  private async _getUserFromContext(context?: Context) {
    if(!!context?.user) {
      return await UserModel.query().where('id', context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      return ctx?.auth?.user
    }
  }
}