import { belongsTo, column } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import User from './User.js'
import { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type ApiTokenType = 'api' | 'refresh' | 'resetPassword' | 'confirmRegistration'

export default class ApiToken extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @column()
  public name: string

  @column()
  public type: ApiTokenType

  @column()
  public token: string

  @column.dateTime({
    columnName: 'expires_at',
  })
  public expires_at: DateTime

  @column.dateTime({
    autoCreate: true,
    columnName: 'created_at',
  })
  public created_at: DateTime
}
