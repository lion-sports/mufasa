import User from 'App/Models/User';
import { DateTime } from 'luxon'
import { column, beforeCreate, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import { CamelCaseBaseModel } from './CamelCaseBaseModel';

export default class EventSession extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public name: string

  @column()
  public ownedByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'ownedByUserId'
  })
  public ownedBy: BelongsTo<typeof User>

  @beforeCreate()
  public static async generateUid(eventSession: EventSession) {
    eventSession.uid = cuid()
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
