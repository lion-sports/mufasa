import { DateTime } from 'luxon';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EventsManager from 'App/managers/events.manager'
import ConvocationsManager from 'App/managers/convocations.manager';

export default class EventsController {
  public async index({ request }: HttpContextContract) {
    const filters = request.input('filters')

    if(!!filters) {
      if (!!filters.from) filters.from = DateTime.fromISO(filters.from)
      if (!!filters.to) filters.to = DateTime.fromISO(filters.to)
    }

    const manager = new EventsManager()
    return await manager.list({
      data: {
        filters: filters
      }
    })
  }

  public async store({ request }: HttpContextContract) {
    const event = request.input('event')
    
    const manager = new EventsManager()
    return await manager.create({
      data: event
    })
  }

  public async createWithFrequency({ request }: HttpContextContract) {
    const event = request.input('event')
    const rule = request.input('rule')

    if (!!event?.start) event.start = DateTime.fromISO(event.start)
    if (!!event?.end) event.end = DateTime.fromISO(event.end)

    if (!!rule?.from) rule.from = DateTime.fromISO(rule.from)
    if (!!rule?.to) rule.to = DateTime.fromISO(rule.to)

    const manager = new EventsManager()
    return await manager.createWithFrequency({
      data: {
        event: event,
        rule: rule
      }
    })
  }

  public async copyWeek({ request }: HttpContextContract) {
    const fromWeekNumber = request.input('fromWeekNumber')
    const fromWeekYear = request.input('fromWeekYear')
    const toWeekNumber = request.input('toWeekNumber')
    const toWeekYear = request.input('toWeekYear')
    const team = request.input('team')

    const manager = new EventsManager()
    return await manager.copyWeek({
      data: {
        fromWeekNumber: fromWeekNumber,
        fromWeekYear: fromWeekYear,
        toWeekNumber: toWeekNumber,
        toWeekYear: toWeekYear,
        team: team
      }
    })
  }

  public async update({ request, params }: HttpContextContract) {
    const data = request.body()

    const manager = new EventsManager()
    return await manager.update({
      data: {
        id: params.id,
        ...data
      }
    })
  }

  public async show({ params }: HttpContextContract) {
    const manager = new EventsManager()
    return await manager.get({
      data: {
        id: params.id,
      }
    })
  }

  public async destroy({ params, request }: HttpContextContract) {
    const manager = new EventsManager()
    return await manager.delete({
      data: {
        id: params.id,
        deleteAllFrequency: request.input('deleteAllFrequency')  
      }
    })
  }

  public async convocate({ request, params }: HttpContextContract) {
    let manager = new ConvocationsManager()
    return await manager.convocate({
      data: {
        teammates: request.input('teammates'),
        event: {
          id: params.id
        },
        notes: request.input('notes')
      }
    })
  }

  public async unConvocate({ request, params }: HttpContextContract) {
    let manager = new ConvocationsManager()
    return await manager.unConvocate({
      data: {
        teammates: request.input('teammates'),
        event: {
          id: params.id
        },
        notes: request.input('notes')
      }
    })
  }
}
