import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import scoutsSocket from 'App/managers/scout/scouts.socket'

export default class ScoutEventsController {
  public async add({ request }: HttpContextContract) {
    let trx = await Database.transaction()

    try {
      let results = await scoutsSocket.handleEvent({
        data: {
          data: request.input('event'),
          event: 'scout:add',
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