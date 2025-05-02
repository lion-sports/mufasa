import { DateTime } from 'luxon'
import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import User from './User.js'
import Widget from './Widget.js'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";

export default class Dashboard extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public active: boolean

  @column()
  public default: boolean

  @column()
  public userId: number

  @column()
  public name: string

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => Widget, {
    localKey: 'id',
    foreignKey: 'dashboardId',
  })
  declare widgets: HasMany<typeof Widget>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
