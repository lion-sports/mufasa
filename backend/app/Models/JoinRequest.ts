import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Club from './Club.js'
import User from './User.js'

export type JoinRequestStatus = 'pending' | 'rejected' | 'accepted' | 'discarded'

export default class JoinRequest extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public status: JoinRequestStatus

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
