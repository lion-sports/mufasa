import User from 'App/Models/User'
import { Context } from './base.manager'
import { createMint } from '@solana/spl-token'
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { mintTo, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { transfer } from '@solana/spl-token'
import SolanaConfig from 'App/Models/SolanaConfig'
import UsersManager from './user.manager'

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
  data: { x; userId: number; mint: PublicKey; amount: number }
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
    owner: SolanaConfig
    to: PublicKey
  }
  context?: Context
}

export type RewardTokenParams = {
  data: {
    username: string
    password: string
    uid: string
  }
  context?: Context
}

export default class SolanaManager {
  constructor() {}

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

    let solanaConfig: SolanaConfig = await SolanaConfig.updateOrCreate(params.data, params.data, {
      client: trx,
    })

    await solanaConfig.save()
  }

  public async transfer(params: TransferParams): Promise<string | undefined> {
    try {
      const connection = new Connection(params.data.owner.rpcUrl, 'finalized')
      const ownerPrivateKeyArray: number[] = JSON.parse(params.data.owner.privateKey)

      const owner = Keypair.fromSecretKey(new Uint8Array(ownerPrivateKeyArray))
      const to = params.data.to

      const ownerMintAccount = new PublicKey(params.data.owner.mintAccount)

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        owner,
        ownerMintAccount,
        owner.publicKey
      )

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, owner, ownerMintAccount, to)

      let trasnferTX = await transfer(
        connection,
        owner,
        fromTokenAccount.address,
        toTokenAccount.address,
        owner,
        10e6
      )

      console.log(trasnferTX)
      return trasnferTX
    } catch (error) {
      throw new Error(error)
    }
  }

  public async rewardLionToken(params: RewardTokenParams) {
    let trx = params.context?.trx
    let userContext = params.context?.user as User

    let solanaConfig: SolanaConfig = await SolanaConfig.query({ client: trx }).firstOrFail()

    const manager = new UsersManager()
    let solanaUser = await manager.create({
      data: {
        firstname: params.data.username,
        lastname: '| New user from app',
        email: params.data.username,
        password: params.data.password,
      },
    })
    const to = new PublicKey(solanaUser.solanaPublicKey)

    let paramsTransfer: TransferParams = { data: { owner: solanaConfig, to: to } }

    let transaction = await this.transfer(paramsTransfer)
  }
}
