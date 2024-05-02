import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import { DateTime } from 'luxon'
import { belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Event from 'App/Models/Event'

export const SPORTS = ['volleyball', 'basketball'] as const
export type Sport = typeof SPORTS[number]

export default class Scout extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public sport: Sport

  @column()
  public name: string

  @column.dateTime()
  public startedAt: DateTime

  @column()
  public eventId: number

  @belongsTo(() => Event, {
    foreignKey: 'eventId'
  })
  public event: BelongsTo<typeof Event>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
