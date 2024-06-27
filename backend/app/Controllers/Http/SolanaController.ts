import SolanaManager from "App/managers/solana.manager";
import UsersManager from "App/managers/user.manager";
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SolanaController {
  constructor() {
  }


public async rewardLionToken({ request }: HttpContextContract
  ) {
    const manager = new SolanaManager()
    return await manager.rewardLionToken({
      data: {
        username: request.input('username'),
        password: request.input('password'),
        uid: request.input('uid')
      }
    })
  }
}