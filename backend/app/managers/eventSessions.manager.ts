import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import EventSession from 'App/Models/EventSession'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import { Context, withTransaction, withUser } from './base.manager';
import User from 'App/Models/User';
import { cuid } from '@ioc:Adonis/Core/Helpers'

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

  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = EventSession
      .query({ client: trx })

    if(!!user) {
      query = query.whereHas('ownedBy', builder => builder.where('users.id', user.id))
    }

    const results = await query
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: CreateParams): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if(!params.data.name) throw new Error('name is not defined')

    const createdEventSession = await EventSession.create({
      name: params.data.name,
      uid: cuid(),
      ownedByUserId: user.id
    }, {
      client: trx
    })

    await createdEventSession.related('ownedBy').associate(user)
    return createdEventSession
  }

  @withTransaction
  @withUser
  public async get(params: GetParams): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    let query = EventSession
      .query({
        client: trx
      })
      .whereHas('ownedBy', builder => builder.where('users.id', user.id))

    return await query.where('id', params.data.id).firstOrFail()
  }

  @withTransaction
  @withUser
  public async update(params: UpdateParams): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if(!params.data.id) throw new Error('id must be defined')

    const eventSession = await EventSession
      .query({ client: trx })
      .where('id', params.data.id)
      .whereHas('ownedBy', builder => builder.where('users.id', user.id))
      .firstOrFail()

    eventSession.merge({
      name: params.data.name,
    })

    return await eventSession.save()
  }

  @withTransaction
  @withUser
  public async destroy(params: DestroyParams): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if(!params.data.id) throw new Error("id must be defined");

    let eventSession = await EventSession.query({ client: trx })
      .where('id', params.data.id)
      .whereHas('ownedBy', builder => builder.where('users.id', user.id))
      .firstOrFail()

    await eventSession.delete()
  }
}