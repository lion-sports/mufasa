import { BaseModel } from '@adonisjs/lucid/orm'
import { CamelCaseNameStrategy } from '#app/Strategies/CamelCaseStrategy'

export class CamelCaseBaseModel extends BaseModel {
  public static namingStrategy = new CamelCaseNameStrategy()
}