import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import scoutsSocket from '#app/managers/scout/scouts.socket'

export default class ScoutEventsController {
  public async add({ request }: HttpContext) {
    let trx = await db.transaction()
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