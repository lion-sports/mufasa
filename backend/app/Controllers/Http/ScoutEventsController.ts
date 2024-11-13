import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import scoutsSocket from 'App/managers/scout/scouts.socket'
import Scout from 'App/Models/Scout'

export default class ScoutEventsController {
  public async add({ request, params }: HttpContextContract) {
    let trx = await Database.transaction()
    let scout = await Scout.query({ client: trx })
      .preload('event')
      .preload('scoutInfo')
      .where('id', params.id)
      .firstOrFail()

    return await scoutsSocket.handleAdd({
      data: {
        scoutEvent: request.input('event'),
        scout
      },
      context: {
        trx
      }
    })
  }
}