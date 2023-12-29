import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasOne, belongsTo, column, computed, hasOne } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import User from './User'

export default class ApiToken extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User>

  @column()
  public name: string

  @column()
  public type: 'api' | 'refresh' | 'resetPassword'

  @column()
  public token: string

  @column.dateTime({
    columnName: 'expires_at'
  })
  public expires_at: DateTime

  @column.dateTime({
    autoCreate: true,
    columnName: 'created_at'
  })
  public created_at: DateTime
}
