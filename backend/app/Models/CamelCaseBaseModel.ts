import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseNameStrategy } from 'App/Strategies/CamelCaseStrategy'

export class CamelCaseBaseModel extends BaseModel {
  public static namingStrategy = new CamelCaseNameStrategy()
}