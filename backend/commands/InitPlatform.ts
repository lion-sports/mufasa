import { BaseCommand } from '@adonisjs/core/build/standalone'
import SolanaManager, { ConfigParams, MintParams, TokenParams } from 'App/managers/solana.manager'
import { Keypair, PublicKey } from '@solana/web3.js'
import Database from '@ioc:Adonis/Lucid/Database'
import SolanaConfig from 'App/Models/SolanaConfig'

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
    let trx = await Database.transaction()
    try {
      this.logger.info('Initializing platform on Solana...')

      const keypair: Keypair = Keypair.generate()
      const privateString: string = '[' + keypair.secretKey.toString() + ']'

      let config = {
        rpcUrl: 'https://api.devnet.solana.com',
        publicKey: keypair.publicKey.toBase58(),
        privateKey: privateString,
        mintAccount: '',
        tokenAccount: '',
        totalSupply: 0,
      }
      let solanaConfig: SolanaConfig = await SolanaConfig.updateOrCreate(config, config, {
        client: trx,
      })

      console.log({
        publicKey: solanaConfig.publicKey,
        privateKey: solanaConfig.privateKey,
      })

      this.logger.success('Done')

      await trx.commit()
    } catch (error) {
      console.log(error)
      await trx.rollback()
    }
  }
}
