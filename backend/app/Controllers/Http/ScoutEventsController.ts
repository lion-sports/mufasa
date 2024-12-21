import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import scoutsSocket from 'App/managers/scout/scouts.socket'

export default class ScoutEventsController {
  public async add({ request }: HttpContextContract) {
    let trx = await Database.transaction()
    let clientIdentifier = request.input('clientIdentifier')

    try {
      let results = await scoutsSocket.handleEvent({
        data: {
          data: request.input('event'),
          event: 'scout:add',
          clientIdentifier
        },
        context: {
          trx
        }
      })
      await trx.commit()
      return results
    } catch(e) {
      await trx.rollback()
      throw e
    }
  }
}