import { BaseCommand } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'
import SolanaManager from 'App/managers/solana.manager'
import UsersManager from 'App/managers/user.manager'

export default class InitPlatform extends BaseCommand {
  public static commandName = 'init:platform'

  public static description = 'Initiialize platform'

  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  public async createSolanaAdminUser(): Promise<User> {
    const manager = new UsersManager()
    let params = {
      firstname: 'platform',
      email: 'admin@platform.it',
      lastname: 'blockchain',
      password: 'qQxSHimmk6F9MX',
      system: true,
    }
    return manager.create({data: params})
  }
  public async run() {
    this.logger.info('Initializing platform on Solana...')
    try { 
      const manager = new SolanaManager()

      let systemUser = await this.createSolanaAdminUser()
      let params = { data: { userId: systemUser.id } }


      await manager.keygen(params)
      await manager.airdrop(params)
      await manager.intiMint(params)
      
    } catch (error) {

    }
  }
}
