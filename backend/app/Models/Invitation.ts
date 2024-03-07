import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import { DateTime } from 'luxon'
import { belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Team from 'App/Models/Team'
import Role from 'App/Models/Role'

export default class Invitation extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public invitedByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'invitedByUserId'
  })
  public invitedBy: BelongsTo<typeof User>

  @column()
  public invitedUserId: number

  @belongsTo(() => User, {
    foreignKey: 'invitedUserId'
  })
  public invite: BelongsTo<typeof User>

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

  @column()
  public status: 'pending' | 'rejected' | 'accepted' | 'discarded'

  @column()
  public invitedEmail: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
