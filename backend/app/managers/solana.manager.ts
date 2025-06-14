import User from '#app/Models/User'
import { Context, withTransaction } from './base.manager.js'
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import SolanaConfig from '#app/Models/SolanaConfig'
import UsersManager from './user.manager.js'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token'

export type SolanaParams = {
  data: {
    userId: number
  }
  context?: Context
}
export type MintParams = {
  data: {
    privateKey: string
  }
  context?: Context
}
export type TokenParams = {
  data: { privateKey: string; mint: PublicKey; amount: number }
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

export type TransferParams = {
  data: {
    to: PublicKey
    amount: number
  }
  context?: Context
}

export type RewardTokenParams = {
  data: {
    solanaPublicKey: string
    amount: number
  }
  context?: Context
}

export default class SolanaManager {
  constructor() {}

  @withTransaction
  public async keygen(params: SolanaParams): Promise<{ publicKey: string; privateKey: string }> {
    let trx = params.context?.trx
    let userContext = params.context?.user as User

    let user: User = await User.query({ client: trx })
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
    let trx = params.context?.trx
    let solanaConfig: SolanaConfig = await SolanaConfig.query({ client: trx }).firstOrFail()

    const jsonArray: number[] = JSON.parse(solanaConfig.privateKey)
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))

    const connection = new Connection(solanaConfig.rpcUrl, 'finalized')

    console.log('pippo')
    const mint = await createMint(connection, keypair, keypair.publicKey, null, 6)
    console.log('pluto')

    return mint
  }

  public async createToken(params: TokenParams): Promise<PublicKey> {
    let trx = params.context?.trx
    let solanaConfig: SolanaConfig = await SolanaConfig.query({ client: trx }).firstOrFail()
    const jsonArray: number[] = JSON.parse(solanaConfig.privateKey)
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))

    const connection = new Connection(solanaConfig.rpcUrl, 'finalized')
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

  public async update(params: ConfigParams): Promise<void> {
    let trx = params.context?.trx

    let solanaConfig: SolanaConfig = await SolanaConfig.updateOrCreate(params.data, params.data, {
      client: trx,
    })

    await solanaConfig.save()
  }

  public async transfer(params: TransferParams): Promise<string | undefined> {
    try {
      let trx = params.context?.trx
      let solanaConfig: SolanaConfig = await SolanaConfig.query({ client: trx }).firstOrFail()

      const connection = new Connection(solanaConfig.rpcUrl, 'finalized')
      const mainSolanaJSONPrivateKey: number[] = JSON.parse(solanaConfig.privateKey)

      const mainSolanaKeypair = Keypair.fromSecretKey(new Uint8Array(mainSolanaJSONPrivateKey))

      const to = params.data.to
      const mainMintAccount = new PublicKey(solanaConfig.mintAccount)

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mainSolanaKeypair,
        mainMintAccount,
        mainSolanaKeypair.publicKey
      )

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mainSolanaKeypair,
        mainMintAccount,
        to
      )

      let trasnferTrx = await transfer(
        connection,
        mainSolanaKeypair,
        fromTokenAccount.address,
        toTokenAccount.address,
        mainSolanaKeypair,
        10e6
      )
  
      return trasnferTrx
    } catch (error) {
      throw new Error(error)
    }
  }

  public async reward(params: RewardTokenParams) {
    let trx = params.context?.trx
    let userContext = params.context?.user as User

    const to = new PublicKey(params.data.solanaPublicKey)
    let paramsTransfer: TransferParams = { data: { to: to, amount: params.data.amount } }

    let transaction = await this.transfer(paramsTransfer)
  }

  public async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
