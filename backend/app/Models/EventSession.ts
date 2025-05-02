import User from '#app/Models/User';
import { DateTime } from 'luxon'
import { column, beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

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
