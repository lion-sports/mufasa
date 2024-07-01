import { column } from "@ioc:Adonis/Lucid/Orm";
import { CamelCaseBaseModel } from "./CamelCaseBaseModel";
import { DateTime } from "luxon";

export default class SolanaConfig extends CamelCaseBaseModel {

  static get table () {
    return 'solana_config'
  }
  @column({isPrimary: true})
  public id: number

  @column()
  publicKey: string
  
  @column()
  rpcUrl: string

  @column()
privateKey: string
  
  @column()
  mintAccount: string
  
  @column()
  tokenAccount: string
  
  @column()
  totalSupply: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

}