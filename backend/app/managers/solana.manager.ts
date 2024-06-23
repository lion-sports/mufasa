import User from 'App/Models/User'
import { Context } from './base.manager'
import { createMint } from '@solana/spl-token'
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { mintTo, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import ConfigSolana from 'App/Models/ConfigSolana'

export type SolanaParams = {
  data: {
    userId: number
  }
  context?: Context
}
export type MintParams = {
  data: {
    userId: number
  }
  context?: Context
}
export type TokenParams = {
  data: {
    userId: number
    mint: PublicKey
    amount: number
  }
  context?: Context
}

export type ConfigParams = {
  data: {
    publicKey: string
    rpcUrl: string
    privateKey: string
    mintAccount: string
    tokenAccount: string
    totalSupply: number
  }
  context?: Context
}

export default class SolanaManager {
  constructor() {}

  public async keygen(params: SolanaParams): Promise<{ publicKey: string; privateKey: string }> {
    let user: User = await User.query({ client: params.context?.trx })
      .where('id', Number(params.data.userId))
      .firstOrFail()

    const keypair: Keypair = Keypair.generate()
    const privateString: string = '[' + keypair.secretKey.toString() + ']'

    user.merge({
      solanaPublicKey: keypair.publicKey.toBase58(),
      solanaPrivateKey: privateString,
    })
    await user.save()

    return { publicKey: user.solanaPublicKey, privateKey: privateString }
  }

  public async airdrop(params: SolanaParams) {
    try {
      let user: User = await User.query({ client: params.context?.trx })
        .where('id', Number(params.data.userId))
        .firstOrFail()

      const connection = new Connection('https://api.devnet.solana.com', 'finalized')
      const solanaPublicKey = new PublicKey(user.solanaPublicKey)

      await connection.requestAirdrop(solanaPublicKey, 0.1 * LAMPORTS_PER_SOL)

    } catch (error) {
      console.log(error)
    }
  }

  public async createMint(params: MintParams): Promise<PublicKey> {
    let user: User = await User.query({ client: params.context?.trx })
      .where('id', Number(params.data.userId))
      .firstOrFail()

    const jsonArray: number[] = JSON.parse(user.solanaPrivateKey)
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))

    const connection = new Connection('https://api.devnet.solana.com', 'finalized')

    const mint = await createMint(connection, keypair, keypair.publicKey, null, 6)

    return mint
  }

  public async createToken(params: TokenParams): Promise<PublicKey> {
    let user: User = await User.query({ client: params.context?.trx })
      .where('id', Number(params.data.userId))
      .firstOrFail()

    const jsonArray: number[] = JSON.parse(user.solanaPrivateKey)
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))
    const connection = new Connection('https://api.devnet.solana.com', 'finalized')
    const mint = params.data.mint
    const amount = params.data.amount
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    )

    await mintTo(connection, keypair, mint, tokenAccount.address, keypair, amount)

    return tokenAccount.address
  }

  public async saveConfig(params: ConfigParams): Promise<void> {
    let trx = params.context?.trx

    let configSolana: ConfigSolana = await ConfigSolana.updateOrCreate(params.data, params.data, {
      client: trx,
    })

    await configSolana.save()
  }
}
