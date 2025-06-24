import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Place from './Place.js'
import User from './User.js'

export const BOOKING_STATUSES = ['requested', 'confirmed', 'rejected'] as const
export type BookingStatus = typeof BOOKING_STATUSES[number]

export default class Booking extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public placeId: number

  @belongsTo(() => Place, {
    foreignKey: 'placeId'
  })
  public place: BelongsTo<typeof Place>

  @column()
  public createdByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'createdByUserId'
  })
  public createdByUser: BelongsTo<typeof User>

  @column.dateTime()
  public from: DateTime

  @column.dateTime()
  public to: DateTime

  @column()
  public status: BookingStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}