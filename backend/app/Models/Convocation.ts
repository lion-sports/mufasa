import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Event from '#app/Models/Event'
import Teammate from '#app/Models/Teammate'
import User from '#app/Models/User'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Convocation extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public notes: string

  @column()
  public confirmationStatus: 'confirmed' | 'denied' | 'pending'

  @column.dateTime({ autoCreate: true })
  public updateConfirmationAt: DateTime

  @column()
  public confirmedByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'confirmedByUserId'
  })
  public confirmedBy: BelongsTo<typeof User>

  @column({
    serialize: (value) => {
      return parseInt(value)
    }
  })
  public eventId: number

  @belongsTo(() => Event, {
    foreignKey: 'eventId'
  })
  public event: BelongsTo<typeof Event>

  @column()
  public teammateId: number

  @belongsTo(() => Teammate, {
    foreignKey: 'teammateId'
  })
  public teammate: BelongsTo<typeof Teammate>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
