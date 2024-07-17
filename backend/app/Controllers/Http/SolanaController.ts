import SolanaManager from "App/managers/solana.manager";
import UsersManager from "App/managers/user.manager";
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SolanaController {
  constructor() {
  }


public async reward({ request }: HttpContextContract
  ) {
    const manager = new SolanaManager()
    return await manager.reward({
      data: {
        solanaPublicKey: request.input('solanaPublicKey'),
        amount: request.input('amount'),
        
      }
    })
  }
}