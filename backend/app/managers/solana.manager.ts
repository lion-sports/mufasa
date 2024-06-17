import User from 'App/Models/User'
import { Context, withUser } from './base.manager'
import  { createMint } from "@solana/spl-token"
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL  } from "@solana/web3.js";
import  { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token"
import ConfigSolana from 'App/Models/ConfigSolana';
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
        0.2 * LAMPORTS_PER_SOL
      )

    } catch (error) {
      console.log(error)
    }
  }

  public async intiMint(params: MintParams): Promise<void> {
    
    let user: User = await User.query({ client: params.context?.trx })
    .where('id', Number(params.data.userId))
    .firstOrFail()

    const jsonArray: number[] = JSON.parse(user.solanaPrivateKey);
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))
    
    let configSolana: ConfigSolana = await ConfigSolana.query({ client: params.context?.trx }).firstOrFail()
    const connection = new Connection(configSolana.rcp, "finalized");

    const mint = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      6
    )

    //TODO save mint in config_solana
  }


  public async createMint(): Promise<void> {

    let user = new User();
    
    const jsonArray: number[] = JSON.parse(user.solanaPrivateKey);
    const keypair = Keypair.fromSecretKey(new Uint8Array(jsonArray))
    const connection = new Connection("https://api.devnet.solana.com", "finalized");
    
    const mint = new PublicKey("9FrvxQhjHy42i4RBz7v5Qmfga1ei2zqWkzmWPzsm6SEq")

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey)


      await mintTo(
        connection,
        keypair, 
        mint,
        tokenAccount.address,
        keypair,
        50e6
      )

    console.log(`Minted 50 token to ${tokenAccount.address.toBase58()}`)
      

  }
}

export default SolanaManager
