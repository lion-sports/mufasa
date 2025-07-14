import EventSession from '#app/Models/EventSession'
import { Context, withTransaction, withUser } from './base.manager.js';
import User from '#app/Models/User';
import { cuid } from '@adonisjs/core/helpers'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from "@adonisjs/lucid/types/model";
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js';
import { AGGREGATION_STRATEGY_TYPES, AggregationStrategyType } from '#models/AggregationStrategy';
import vine from '@vinejs/vine'
import { DateTime } from 'luxon';
import Team from '#models/Team';

export default class EventSessionManager {

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number,
      perPage?: number
    },
    context?: Context
  }): Promise<{ data: ModelObject[], meta: any }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = EventSession
      .query({ client: trx })
    
    query = query.where(b => {
      return AuthorizationHelpers.viewableEventSessionsQuery({
        data: {
          query: b,
          user
        },
        context: params.context
      })
    })

    const results = await query
      .paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      name: string,
      eventStatusId?: number,
      teamId: number,
      aggregationStrategy?: {
        type: AggregationStrategyType
        fromDate?: Date
        toDate?: Date
      }
    },
    context?: Context
  }): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if(!params.data.name) throw new Error('name is not defined')

    const createEventSessionValidator = vine.compile(
      vine.object({
        name: vine.string().minLength(1),
        eventStatusId: vine.number().optional(),
        teamId: vine.number(),
        aggregationStrategy: vine
          .object({
            type: vine.enum(AGGREGATION_STRATEGY_TYPES),
            fromDate: vine.date({ formats: { utc: true } }).optional(),
            toDate: vine.date({ formats: { utc: true } }).optional(),
          })
          .optional(),
      })
    )

    let validatedData = await createEventSessionValidator.validate(params.data)

    const team = await Team.query({
        client: trx
      })
      .where(b => {
        return AuthorizationHelpers.viewableTeamsQuery({
          data: {
            query: b,
            user
          },
          context: params.context
        })
      })
      .where('teams.id', validatedData.teamId)
      .preload('eventStatuses')
      .firstOrFail()

    if (!!validatedData.eventStatusId && !team.eventStatuses.map((e) => e.id).includes(validatedData.eventStatusId)) {
      throw new Error('cannot find status')
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_create',
        data: {
          team
        }
      },
      context: params.context
    })

    const createdEventSession = await EventSession.create({
      name: validatedData.name,
      uid: cuid(),
      ownedByUserId: user.id
    }, {
      client: trx
    })

    await createdEventSession.related('ownedBy').associate(user)

    if (!!validatedData.aggregationStrategy) {
      await createdEventSession.related('aggregationStrategy').create({
        type: validatedData.aggregationStrategy.type,
        fromDate: !!validatedData.aggregationStrategy.fromDate ? DateTime.fromJSDate(validatedData.aggregationStrategy.fromDate) : undefined,
        toDate: !!validatedData.aggregationStrategy.toDate ? DateTime.fromJSDate(validatedData.aggregationStrategy.toDate) : undefined
      })
    }

    return createdEventSession
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<EventSession> {
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
  public async update(params: {
    data: {
      id: number,
      name?: string,
      eventStatusId?: number
      aggregationStrategy?: {
        type: AggregationStrategyType
        fromDate?: Date
        toDate?: Date
      }
    },
    context?: Context
  }): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if(!params.data.id) throw new Error('id must be defined')

    const updateEventSessionValidator = vine.compile(
      vine.object({
        id: vine.number(),
        name: vine.string().minLength(1),
        eventStatusId: vine.number().optional(),
        aggregationStrategy: vine
          .object({
            type: vine.enum(AGGREGATION_STRATEGY_TYPES),
            fromDate: vine.date({ formats: { utc: true } }).optional(),
            toDate: vine.date({ formats: { utc: true } }).optional(),
          })
          .optional(),
      })
    )

    let validatedData = await updateEventSessionValidator.validate(params.data)

    const eventSession = await EventSession
      .query({ client: trx })
      .where('id', validatedData.id)
      .where(b => {
        return AuthorizationHelpers.viewableEventSessionsQuery({
          data: {
            query: b,
            user
          },
          context: params.context
        })
      })
      .preload('team', b => {
        b.preload('eventStatuses')
      })
      .firstOrFail()

    if (!!validatedData.eventStatusId && !eventSession.team.eventStatuses.map((e) => e.id).includes(validatedData.eventStatusId)) {
      throw new Error('cannot find status')
    }

    eventSession.merge({
      name: validatedData.name,
      eventStatusId: validatedData.eventStatusId
    })

    if (!!validatedData.aggregationStrategy) {
      await eventSession.related('aggregationStrategy').firstOrCreate({}, {
        type: validatedData.aggregationStrategy.type,
        fromDate: !!validatedData.aggregationStrategy.fromDate ? DateTime.fromJSDate(validatedData.aggregationStrategy.fromDate) : undefined,
        toDate: !!validatedData.aggregationStrategy.toDate ? DateTime.fromJSDate(validatedData.aggregationStrategy.toDate) : undefined
      })
    }

    return await eventSession.save()
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    },
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if(!params.data.id) throw new Error("id must be defined");

    let eventSession = await EventSession.query({ client: trx })
      .where('id', params.data.id)
      .where(b => {
        return AuthorizationHelpers.viewableEventSessionsQuery({
          data: {
            query: b,
            user
          },
          context: params.context
        })
      })
      .firstOrFail()

    await eventSession.delete()
  }


  @withTransaction
  @withUser
  public async addEvents(params: {
    data: {
      events: {
        id: number
      }[],
      eventSession: {
        id: number
      }
    },
    context?: Context
  }): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    let eventSession = await EventSession.query({ client: trx })
      .where('id', params.data.eventSession.id)
      .where(b => {
        return AuthorizationHelpers.viewableEventSessionsQuery({
          data: {
            query: b,
            user
          },
          context: params.context
        })
      })
      .firstOrFail()

    await eventSession.related('events').attach(params.data.events.map(e => e.id))
    await eventSession.load('events')

    return eventSession
  }

  @withTransaction
  @withUser
  public async removeEvents(params: {
    data: {
      events: {
        id: number
      }[],
      eventSession: {
        id: number
      }
    },
    context?: Context
  }): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    let eventSession = await EventSession.query({ client: trx })
      .where('id', params.data.eventSession.id)
      .where(b => {
        return AuthorizationHelpers.viewableEventSessionsQuery({
          data: {
            query: b,
            user
          },
          context: params.context
        })
      })
      .firstOrFail()

    await eventSession.related('events').detach(params.data.events.map(e => e.id))
    await eventSession.load('events')

    return eventSession
  }


  @withTransaction
  @withUser
  public async setEvents(params: {
    data: {
      events: {
        id: number
      }[],
      eventSession: {
        id: number
      }
    },
    context?: Context
  }): Promise<EventSession> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    let eventSession = await EventSession.query({ client: trx })
      .where('id', params.data.eventSession.id)
      .where(b => {
        return AuthorizationHelpers.viewableEventSessionsQuery({
          data: {
            query: b,
            user
          },
          context: params.context
        })
      })
      .firstOrFail()

    await eventSession.related('events').sync(params.data.events.map(e => e.id))
    await eventSession.load('events')

    return eventSession
  }
}