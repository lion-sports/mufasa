import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ConvocationsManager from 'App/managers/convocations.manager'

export default class ConvocationsController {

  public async confirm({ params }: HttpContextContract) {
    let manager = new ConvocationsManager()
    return await manager.confirm({
      data: {
        convocation: {
          id: params.id
        }
      }
    })
  }

  public async deny({ params }: HttpContextContract) {
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
