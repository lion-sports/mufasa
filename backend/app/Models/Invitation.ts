import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#app/Models/User'
import Team from '#app/Models/Team'
import Group from '#app/Models/Group'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

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
  public groupId: number

  @belongsTo(() => Group, {
    foreignKey: 'groupId'
  })
  public group: BelongsTo<typeof Group>

  @column()
  public status: 'pending' | 'rejected' | 'accepted' | 'discarded'

  @column()
  public invitedEmail: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
