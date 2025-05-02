import type { HttpContext } from '@adonisjs/core/http'
import ConvocationsManager from '#app/managers/convocations.manager'

export default class ConvocationsController {

  public async confirm({ params }: HttpContext) {
    let manager = new ConvocationsManager()
    return await manager.confirm({
      data: {
        convocation: {
          id: params.id
        }
      }
    })
  }

  public async deny({ params }: HttpContext) {
    let manager = new ConvocationsManager()
    return await manager.deny({
      data: {
        convocation: {
          id: params.id
        }
      }
    })
  }
}
