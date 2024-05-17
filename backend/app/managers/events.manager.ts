import { DateTime } from 'luxon';
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { CreateEventValidator, CreateEventWithFrequencyValidator, UpdateEventValidator } from 'App/Validators/events'
import Team from 'App/Models/Team'
import Event from 'App/Models/Event'
import Frequency from 'App/Models/Frequency';
import { validator } from "@ioc:Adonis/Core/Validator"
import AuthorizationManager from './authorization.manager';
import ConvocationManager from './convocations.manager';
import { withUser, Context, withTransaction } from './base.manager';
import User from 'App/Models/User';

export type ListParams = {
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
}

export type CreateParams = {
  data: {
    start: DateTime,
    end: DateTime,
    name: string,
    description?: string,
    status?: 'confirmed' | 'notConfirmed',
    team: {
      id: number
    },
    convocations?: {
      teammateId: number
    }[]
  },
  context?: Context
}

export type CreateWithFrequencyParams = {
  data: {
    event: {
      start: DateTime,
      end: DateTime,
      name: string,
      description?: string,
      status?: 'confirmed' | 'notConfirmed',
      team: {
        id: number
      }
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
}

export type UpdateParams = {
  data: {
    id: number,
    start?: DateTime,
    end?: DateTime,
    name?: string,
    description?: string,
    status?: 'confirmed' | 'notConfirmed',
    updateAllFrequency?: boolean
  },
  context?: Context
}

export type CopyWeekParams = {
  data: {
    fromWeekNumber: number,
    fromWeekYear: number,
    toWeekNumber: number,
    toWeekYear: number,
    team: { id: number }
  },
  context?: Context
}

export type DeleteParams = {
  data: {
    id: number,
    deleteAllFrequency?: boolean
  },
  context?: Context
}

export type GetParams = {
  data: {
    id: number,
  },
  context?: Context
}

export default class EventsManager {
  constructor() {
  }

  @withTransaction
  @withUser
  public async list(params: ListParams) {
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
  public async create(params: CreateParams): Promise<Event> {
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
        action: 'create',
        resource: 'Event',
        entities: {
          team: params.data.team
        }
      },
      context: {
        trx: trx
      }
    })

    // check if team exists
    const team = await Team.query({
        client: trx
      })
      .whereHas('teammateUsers', builder => {
        builder.where('users.id', user.id)
      })
      .where('teams.id', params.data.team.id)
      .firstOrFail()

    const createdEvent = await Event.create({
      start: params.data.start,
      end: params.data.end,
      name: params.data.name,
      description: params.data.description,
      status: params.data.status || 'confirmed',
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
  public async createWithFrequency(params: CreateWithFrequencyParams): Promise<Event[]> {
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
        action: 'create',
        resource: 'Event',
        entities: {
          team: params.data.event.team
        }
      },
      context: {
        trx: trx
      }
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
        status: 'confirmed' | 'notConfirmed',
        teamId: number,
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
            status: params.data.event.status || 'confirmed',
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

    // create with month rule
    else if(params.data.rule.frequency == 'month') {
      const daysInFrequency: number = this._getDaysBetweenDates(params.data.rule.from, params.data.rule.to)

      let events: {
        start: DateTime,
        end: DateTime,
        name: string,
        description?: string,
        status: 'confirmed' | 'notConfirmed',
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
            status: params.data.event.status || 'confirmed',
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

    return results
  }

  @withTransaction
  @withUser
  public async copyWeek(params: CopyWeekParams): Promise<Event[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'create',
        resource: 'Event',
        entities: {
          team: params.data.team
        }
      },
      context: {
        trx: trx
      }
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
          start: events[i].start.set({ weekNumber: params.data.toWeekNumber }),
          end: events[i].end.set({ weekNumber: params.data.toWeekYear }),
          name: events[i].name,
          description: events[i].description,
          status: events[i].status,
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
  public async update(params: UpdateParams): Promise<Event | Event[]> {
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
        action: 'update',
        resource: 'Event',
        entities: {
          event: params.data 
        }
      },
      context: {
        trx: trx
      }
    })

    // check if event exists and belongs to user teams
    const event = await Event.query()
      .where('events.id', params.data.id)
      .whereHas('team', (teamBuilder) => {
        teamBuilder.whereHas('teammateUsers', (tuBuilder) => {
          tuBuilder.where('users.id', user.id)
        })
      })
      .firstOrFail()
    
    let results: Event | Event[]
    
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
        status?: 'confirmed' | 'notConfirmed',
        updateAllFrequency?: boolean
      } = {...params.data}

      delete updateParams.updateAllFrequency
      delete updateParams.id

      results = []
      for(let i = 0; i < eventsToUpdate.length; i += 1) {
        results.push(await eventsToUpdate[i].merge(updateParams).save())
      }
    } else {
      if (!!params.data.start) event.start = params.data.start
      if (!!params.data.end) event.end = params.data.end
      if (!!params.data.name) event.name = params.data.name
      if (!!params.data.description) event.description = params.data.description
      if (!!params.data.status) event.status = params.data.status

      results = await event.save()
    }

    return results
  }

  @withTransaction
  @withUser
  public async delete(params: DeleteParams): Promise<void> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'destroy',
        resource: 'Event',
        entities: {
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
  public async get(params: GetParams): Promise<Event> {
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

    let canViewScout = await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'view',
        resource: 'Scout',
        entities: {
          team: {
            id: event.teamId
          }
        }
      },
      context: {
        trx,
        user
      }
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