import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Teammate from './Teammate.js'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Shirt extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public number: number

  @column()
  public name?: string | null
  
  @column()
  public primaryColor?: string | null
  
  @column()
  public secondaryColor?: string | null

  @column()
  public teammateId: number

  @belongsTo(() => Teammate, {
    foreignKey: 'teammateId'
  })
  public teammate: BelongsTo<typeof Teammate>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
