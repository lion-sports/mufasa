import { DateTime } from 'luxon';
import { CreateEventValidator, CreateEventWithFrequencyValidator, UpdateEventValidator } from '#app/Validators/events/index'
import Team from '#app/Models/Team'
import Event from '#app/Models/Event'
import Frequency from '#app/Models/Frequency';
import { validator } from "@adonisjs/validator"
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js';
import ConvocationManager from './convocations.manager.js';
import { withUser, Context, withTransaction } from './base.manager.js';
import User from '#app/Models/User';
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class EventsManager {
  @withTransaction
  @withUser
  public async list(params: {
    data: {
      filters: {
        from: DateTime,
        to: DateTime,
        team?: {
          id: number
        }
      },
    },
    context?: Context
  }) {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    let query = Event.query({ client: trx}) 

    if(!!params.data.filters) {
      if(!!params.data.filters.from) {
        query = query.where('start', '>=', params.data.filters.from.toJSDate())
      }

      if (!!params.data.filters.to) {
        query = query.where('start', '<=', params.data.filters.to.toJSDate())
      } 

      if (!!params.data.filters.team?.id) {
        let teamId: number = params.data.filters.team.id
        query = query.whereHas('team', builder => builder.where('teams.id', teamId))
      }
    }

    query = query.whereHas('team', (builder) => {
      builder.whereHas('teammates', (builder) => {
          builder.where('teammates.userId', user.id)
        })
        .orWhere('ownerId', user.id)
    })

    let results = await query
      .preload('team')
      .preload('createdBy')
      .preload('frequency')
      .preload('convocations')

    return results
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      start: DateTime,
      end: DateTime,
      name: string,
      description?: string,
      eventStatusId?: number,
      team: {
        id: number
      },
      convocations?: {
        teammateId: number
      }[]
    },
    context?: Context
  }): Promise<Event> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new CreateEventValidator().schema,
      data: {
        ...params.data,
      }
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_create',
        data: {
          team: params.data.team
        }
      },
      context: params.context
    })

    // check if team exists
    const team = await Team.query({
        client: trx
      })
      .whereHas('teammateUsers', builder => {
        builder.where('users.id', user.id)
      })
      .preload('eventStatuses')
      .where('teams.id', params.data.team.id)
      .firstOrFail()
    
    if(!!params.data.eventStatusId && !team.eventStatuses.map((e) => e.id).includes(params.data.eventStatusId)) {
      throw new Error('cannot find status')
    }

    const createdEvent = await Event.create({
      start: params.data.start,
      end: params.data.end,
      name: params.data.name,
      description: params.data.description,
      eventStatusId: params.data.eventStatusId,
      createdByUserId: user.id
    }, {
      client: trx
    })

    await createdEvent.related('team').associate(team)

    if(!!params.data.convocations) {
      let manager = new ConvocationManager()
      await manager.convocate({
        data: {
          teammates: params.data.convocations?.map(el => { 
            return { id: el.teammateId } 
          }),
          event: createdEvent
        },
        context: {
          trx: trx
        }
      })
    }

    return createdEvent
  }

  @withTransaction
  @withUser
  public async createWithFrequency(params: {
    data: {
      event: {
        start: DateTime,
        end: DateTime,
        name: string,
        description?: string,
        team: {
          id: number
        },
        eventStatusId?: number
      },
      rule: {
        frequency: 'week' | 'month',
        from: DateTime,
        to: DateTime,
        daysOfWeek: number[], // 1 | 2 | 3 | 4 | 5 | 6 | 7
        daysOfMonth: number[] // 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31
      }
    },
    context?: Context
  }): Promise<Event[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new CreateEventWithFrequencyValidator().schema,
      data: {
        ...params.data,
      }
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_create',
        data: {
          team: params.data.event.team
        }
      },
      context: params.context
    })

    // check if team exists and user belongs to it
    await Team.query({
        client: trx
      })
      .whereHas('teammateUsers', builder => {
        builder.where('users.id', user.id)
      })
      .where('teams.id', params.data.event.team.id)
      .firstOrFail()

    // create the frequency
    const frequency = await Frequency.create({}, {client: trx})

    let results

    // creating with week rule
    if(params.data.rule.frequency == 'week') {
      const daysInFrequency: number = this._getDaysBetweenDates(params.data.rule.from, params.data.rule.to)

      let events: {
        start: DateTime,
        end: DateTime,
        name: string,
        description?: string,
        teamId: number,
        eventStatusId?: number,
        frequencyId: number
      }[] = []
      

      for(let i = 0; i < daysInFrequency; i += 1) {
        let start = params.data.rule.from
        start = start.plus({ days: i })
        start = start.set({ 
          hour: params.data.event.start.get('hour'),
          minute: params.data.event.start.get('minute'),
          second: params.data.event.start.get('second'),
          millisecond: 0
        })

        let end = params.data.rule.to
        end = end.plus({ days: i })
        end = end.set({
          hour: params.data.event.end.get('hour'),
          minute: params.data.event.end.get('minute'),
          second: params.data.event.end.get('second'),
          millisecond: 0
        })

        if(params.data.rule.daysOfWeek.includes(start.weekday)) {
          events.push({
            start: start,
            end: end,
            name: params.data.event.name,
            description: params.data.event.description,
            teamId: params.data.event.team.id,
            eventStatusId: params.data.event.eventStatusId,
            frequencyId: frequency.id
          })
        }
      }

      const createdEvents = await Event.createMany(events, {
        client: trx
      })

      results = await Event
        .query({ client: trx })
        .whereIn('id', createdEvents.map(event => event.id))
        .preload('team')
    }

    // create with month rule
    else if(params.data.rule.frequency == 'month') {
      const daysInFrequency: number = this._getDaysBetweenDates(params.data.rule.from, params.data.rule.to)

      let events: {
        start: DateTime,
        end: DateTime,
        name: string,
        description?: string,
        eventStatusId?: number,
        teamId: number,
        frequencyId: number
      }[] = []


      for (let i = 0; i < daysInFrequency; i += 1) {
        let start = params.data.rule.from
        start.plus({ days: i })
        start.set({
          hour: params.data.event.start.get('hour'),
          minute: params.data.event.start.get('minute'),
          second: params.data.event.start.get('second'),
          millisecond: 0
        })

        let end = params.data.rule.to
        end.plus({ days: i })
        end.set({
          hour: params.data.event.end.get('hour'),
          minute: params.data.event.end.get('minute'),
          second: params.data.event.end.get('second'),
          millisecond: 0
        })

        if(params.data.rule.daysOfMonth.includes(start.day)) {
          events.push({
            start: start,
            end: end,
            name: params.data.event.name,
            description: params.data.event.description,
            eventStatusId: params.data.event.eventStatusId,
            teamId: params.data.event.team.id,
            frequencyId: frequency.id
          })
        }
      }

      const createdEvents = await Event.createMany(events, {
        client: trx
      })

      results = await Event
        .query({ client: trx })
        .whereIn('id', createdEvents.map(event => event.id))
        .preload('team')
    }

    return results || []
  }

  @withTransaction
  @withUser
  public async copyWeek(params: {
    data: {
      fromWeekNumber: number,
      fromWeekYear: number,
      toWeekNumber: number,
      toWeekYear: number,
      team: { id: number }
    },
    context?: Context
  }): Promise<Event[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_create',
        data: {
          team: params.data.team
        }
      },
      context: params.context
    })

    let fromDateFrom = DateTime.fromObject({
      weekday: 1,
      weekNumber: params.data.fromWeekNumber,
      weekYear: params.data.fromWeekYear
    })

    let toDateFrom = DateTime.fromObject({
      weekday: 7,
      weekNumber: params.data.fromWeekNumber,
      weekYear: params.data.fromWeekYear
    }).endOf('day')

    let events = await this.list({
      data: {
        filters: {
          from: fromDateFrom,
          to: toDateFrom
        },
      },
      context: {
        trx: trx,
        user: user
      }
    })


    let results: Event[] = []
    for(let i = 0; i < events.length; i += 1) {
      let event = await this.create({
        data: {
          ...events[i],
          start: events[i].start.set({ weekNumber: params.data.toWeekNumber }),
          end: events[i].end.set({ weekNumber: params.data.toWeekYear }),
          team: params.data.team,
          convocations: events[i].convocations.map((el) => {
            return {
              teammateId: el.teammateId
            }
          })
        }
      })

      results.push(event)
    }

    return results
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number,
      start?: DateTime,
      end?: DateTime,
      name?: string,
      description?: string,
      eventStatusId?: number,
      updateAllFrequency?: boolean
    },
    context?: Context
  }): Promise<Event | Event[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await validator.validate({
      schema: new UpdateEventValidator().schema,
      data: {
        ...params.data,
      }
    })

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_update',
        data: {
          event: params.data 
        }
      },
      context: params.context
    })

    // check if event exists and belongs to user teams
    const event = await Event.query({ client: trx })
      .where('events.id', params.data.id)
      .whereHas('team', (teamBuilder) => {
        teamBuilder.whereHas('teammateUsers', (tuBuilder) => {
          tuBuilder.where('users.id', user.id)
        })
      })
      .preload('team', b => {
        b.preload('eventStatuses')
      })
      .firstOrFail()
    
    let results: Event | Event[]

    if(!!params.data.eventStatusId && !event.team.eventStatuses.map(e => e.id).includes(params.data.eventStatusId)) {
      throw new Error('cannot find status')
    }
    
    if(params.data.updateAllFrequency && !!event.frequencyId) {
      // search for the events in the frequency
      let eventsToUpdate = await Event.query({ client: trx })
        .where('frequencyId', event.frequencyId)

      let updateParams: {
        id?: number
        start?: DateTime,
        end?: DateTime,
        name?: string,
        description?: string,
        updateAllFrequency?: boolean
      } = {...params.data}

      delete updateParams.updateAllFrequency
      delete updateParams.id

      results = []
      for(let i = 0; i < eventsToUpdate.length; i += 1) {
        results.push(await eventsToUpdate[i].merge(updateParams).save())
      }
    } else {
      if (params.data.start !== undefined) event.start = params.data.start
      if (params.data.end !== undefined) event.end = params.data.end
      if (params.data.name !== undefined) event.name = params.data.name
      if (params.data.description !== undefined) event.description = params.data.description
      if (params.data.eventStatusId !== undefined) event.eventStatusId = params.data.eventStatusId

      results = await event.save()
    }

    return results
  }

  @withTransaction
  @withUser
  public async delete(params: {
    data: {
      id: number,
      deleteAllFrequency?: boolean
    },
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_destroy',
        data: {
          event: params.data
        }
      },
      context: {
        trx: trx
      }
    })

    if(!!params.data.deleteAllFrequency) {
      let events = await Event.query({ client: trx })
        .whereIn('frequencyId', eventBuilder => {
          eventBuilder.select('frequencyId').where('id', params.data.id)
        })
        .whereHas('team', teamBuilder => {
          teamBuilder.whereHas('teammateUsers', userBuilder => {
            userBuilder.where('users.id', user.id)
          })
        })

      for(let i = 0; i < events.length; i += 1) {
        await events[i].delete()
      }
    } else {
      let event = await Event.query({ client: trx })
        .where('events.id', params.data.id)
        .whereHas('team', teamBuilder => {
          teamBuilder.whereHas('teammateUsers', userBuilder => {
            userBuilder.where('users.id', user.id)
          })
        })
        .firstOrFail()
      
      await event.delete()
    }
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number,
    },
    context?: Context
  }): Promise<Event> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    let event = await Event.query({ client: trx })
      .where('events.id', params.data.id)
      .whereHas('team', teamBuilder => {
        teamBuilder.whereHas('teammateUsers', userBuilder => {
          userBuilder.where('users.id', user.id)
        })
      })
      .preload('convocations', builder => {
        builder.preload('teammate', builder => {
          builder
            .preload('user')
            .preload('group')
        })
      })
      .preload('createdBy')
      .preload('frequency')
      .preload('team')
      .firstOrFail()

    let canViewScout = await AuthorizationHelpers.userCanInTeam({
      data: {
        user: user,
        resource: 'scout',
        action: 'view',
        team: {
          id: event.teamId
        }
      },
      context: params.context
    })

    if(canViewScout) {
      await event.load('scouts')
    }

    return event
  }

  private _getDaysBetweenDates(from: DateTime, to: DateTime): number {
    return to.diff(from, 'days').toObject().days || 0
  }
}