import SolanaManager, { ConfigParams, MintParams, TokenParams } from '#app/managers/solana.manager'
import { Keypair, PublicKey } from '@solana/web3.js'
import db from '@adonisjs/lucid/services/db'
import SolanaConfig from '#app/Models/SolanaConfig'
import { BaseCommand } from "@adonisjs/core/ace";
import { CommandOptions } from "@adonisjs/core/types/ace";

export default class Token extends BaseCommand {
  public static commandName = 'token'

  public static description = ''
    static options: CommandOptions = {
          loadApp: true,
          staysAlive: false,
        };

  public async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async run() {
    this.logger.info('Hello world!')
    let trx = await db.transaction()

    try {
      let mintAccount: PublicKey
      let tokenAccount: PublicKey
      const manager = new SolanaManager()

      this.logger.info('Creating platform token on Solana...')
      let solanaConfig: SolanaConfig = await SolanaConfig.query({ client: trx }).firstOrFail()

      await this.timeout(5000)
      if (!!solanaConfig) {
        let initParams: MintParams = {
          data: { privateKey: solanaConfig.privateKey },
          context: { trx: trx },
        }

        mintAccount = await manager.createMint(initParams)
        this.logger.success('Platform Token created!')

        this.logger.info('Minting platform token on Solana...')
        await this.timeout(5000)

        let tokenParams: TokenParams = {
          data: { privateKey: solanaConfig.privateKey, mint: mintAccount, amount: 10000e6 },
          context: { trx: trx },
        }

        tokenAccount = await manager.createToken(tokenParams)
        this.logger.success('Minitng Token created!')

        this.logger.info('Saving data..')
        await this.timeout(5000)

        let config: ConfigParams = {
          data: {
            publicKey: solanaConfig.publicKey,
            rpcUrl: solanaConfig.rpcUrl,
            privateKey: solanaConfig.privateKey,
            mintAccount: mintAccount.toBase58(),
            tokenAccount: tokenAccount.toBase58(),
            totalSupply: 240000000e6,
          },
        }

        //Metaplex

        //

        await manager.update(config)
      }
      this.logger.success('Done')

      await trx.commit()
    } catch (error) {
      console.log(error)
      await trx.rollback()
    }
  }
}
