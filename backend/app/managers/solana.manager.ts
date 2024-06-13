import User from 'App/Models/User'
import { Context, withUser } from './base.manager'
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import  { createMint } from "@solana/spl-token"

export type SolanaParams = {
  data: {
    userId: number
  }
  context?: Context
}
export type MintParams = {
  data: {
    userId: number
  },
  context?: Context
}


class SolanaManager {
  constructor() {
    
  }

  public async keygen(params: SolanaParams) {
    
    let user: User = await User.query({ client: params.context?.trx })
    .where('id', Number(params.data.userId))
    .firstOrFail()

    const keypair: Keypair = Keypair.generate()


    let privateString: string = '[' + keypair.secretKey.toString() + ']'

    user.merge({
      solanaPublicKey: keypair.publicKey.toBase58(),
      solanaPrivateKey: privateString,
    })
    await user.save()
    
  }

  public async airdrop(params: SolanaParams) {
    try {
      let user: User = await User.query({ client: params.context?.trx })
        .where('id', Number(params.data.userId))
        .firstOrFail()

      const connection = new Connection('https://api.devnet.solana.com', 'finalized')
      const solanaPublicKey = new PublicKey(user.solanaPublicKey)

      await connection.requestAirdrop(
        solanaPublicKey,
        1 * LAMPORTS_PER_SOL
      )

    } catch (error) {
      console.log(error)
    }
  }

  public async mint(params: MintParams): Promise<void> {
    
    let user: User = await User.query({ client: params.context?.trx })
    .where('id', Number(params.data.userId))
    .firstOrFail()
    console.log('minting')

    const jsonArray: number[] = JSON.parse(user.solanaPrivateKey);
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))

    const connection = new Connection("https://api.devnet.solana.com", "finalized");
    const mint = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      6
    )

    console.log('minted:' + mint.toBase58())

    //TODO save mint in config_solana
  }
}

export default SolanaManager
