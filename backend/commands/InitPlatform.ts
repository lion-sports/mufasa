import SolanaManager, { ConfigParams, MintParams, TokenParams } from '#app/managers/solana.manager'
import { Keypair, PublicKey } from '@solana/web3.js'
import db from '@adonisjs/lucid/services/db'
import SolanaConfig from '#app/Models/SolanaConfig'
import { BaseCommand } from "@adonisjs/core/ace";
import { CommandOptions } from "@adonisjs/core/types/ace";

export default class InitPlatform extends BaseCommand {
  public static commandName = 'init:platform'

  public static description = 'Initiialize platform'
    static options: CommandOptions = {
          loadApp: true,
          staysAlive: false,
        };

  public async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async run() {
    let trx = await db.transaction()
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
