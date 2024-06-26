import { BaseCommand } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'
import SolanaManager, { ConfigParams, MintParams, TokenParams } from 'App/managers/solana.manager'
import UsersManager from 'App/managers/user.manager'
import user from './user.json'
import { PublicKey } from '@solana/web3.js'
import Database from '@ioc:Adonis/Lucid/Database'

export default class InitPlatform extends BaseCommand {
  public static commandName = 'init:platform'

  public static description = 'Initiialize platform'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async run() {
    this.logger.info('Initializing platform on Solana...')
    let trx = await Database.transaction()
    try {
      const userManager = new UsersManager()

      let solanaUser: User | null = await userManager.get({ data: {id: 0, username: 'lion-solana-admin'}, context: { trx: trx } })

      let mintAccount: PublicKey
      let tokenAccount: PublicKey
      const manager = new SolanaManager()

      this.logger.info('Creating platform token on Solana...')
      await this.timeout(3000)
      if(!!solanaUser) {
        let initParams: MintParams = { data: { userId: solanaUser.id }, context: { trx: trx } }
        mintAccount = await manager.createMint(initParams)
        this.logger.success('Platform Token created!')

        this.logger.info('Minting platform token on Solana...')
        await this.timeout(3000)

        let tokenParams: TokenParams = {
          data: { userId: solanaUser.id, mint: mintAccount, amount: 10000e6 },
          context: { trx: trx },
        }

        tokenAccount = await manager.createToken(tokenParams)
        this.logger.success('Minitng Token created!')

        this.logger.info('Saving data..')
        await this.timeout(300)

        let config: ConfigParams = {
          data: {
            publicKey: solanaUser.solanaPublicKey,
            rpcUrl: 'https://api.devnet.solana.com',
            privateKey: solanaUser.solanaPrivateKey,
            mintAccount: mintAccount.toBase58(),
            tokenAccount: tokenAccount.toBase58(),
            totalSupply: 240000000e6,
          },
        }

        //Metaplex

        //
        
        await manager.saveConfig(config)
      }
      this.logger.success('Done')

      await trx.commit()
    } catch (error) {
      console.log(error)
      await trx.rollback()
    }
  }
}
