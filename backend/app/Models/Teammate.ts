import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import { DateTime, } from 'luxon'
import { column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Team from 'App/Models/Team'
import Role from 'App/Models/Role'

export default class Teammate extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public alias: string

  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User>

  @column()
  public teamId: number

  @belongsTo(() => Team, {
    foreignKey: 'teamId'
  })
  public team: BelongsTo<typeof Team>

  @column()
  public roleId: number

  @belongsTo(() => Role, {
    foreignKey: 'roleId'
  })
  public role: BelongsTo<typeof Role>
  

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
