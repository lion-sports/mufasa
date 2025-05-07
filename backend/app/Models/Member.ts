import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime, } from 'luxon'
import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from '#app/Models/User'
import Team from '#app/Models/Team'
import Group from '#app/Models/Group'
import { type HasMany } from "@adonisjs/lucid/types/relations";
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import Club from './Club.js'

export default class Member extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public alias: string

  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User>

  @column()
  public clubId: number

  @belongsTo(() => Club, {
    foreignKey: 'clubId'
  })
  public club: BelongsTo<typeof Club>

  @column()
  public groupId: number

  @belongsTo(() => Group, {
    foreignKey: 'groupId'
  })
  public group: BelongsTo<typeof Group>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
