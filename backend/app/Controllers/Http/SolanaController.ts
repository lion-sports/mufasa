import SolanaManager from "#app/managers/solana.manager";
import UsersManager from "#app/managers/user.manager";
import type { HttpContext } from '@adonisjs/core/http'

export default class SolanaController {
  constructor() {
  }


public async reward({ request }: HttpContext
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