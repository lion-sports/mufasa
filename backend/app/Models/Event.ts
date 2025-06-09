import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Frequency from '#app/Models/Frequency'
import Team from '#app/Models/Team'
import User from '#app/Models/User'
import Convocation from '#app/Models/Convocation'
import Scout from './Scout.js'
import { type HasMany, type ManyToMany, type BelongsTo } from "@adonisjs/lucid/types/relations";
import EventSession from './EventSession.js'
import EventStatus from './EventStatus.js'

export default class Event extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime()
  public start: DateTime

  @column.dateTime()
  public end: DateTime

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public frequencyId: number

  @belongsTo(() => Frequency, {
    foreignKey: 'frequencyId'
  })
  public frequency: BelongsTo<typeof Frequency>

  @column()
  public teamId: number

  @belongsTo(() => Team, {
    foreignKey: 'teamId'
  })
  public team: BelongsTo<typeof Team>

  @column()
  public eventStatusId: number

  @belongsTo(() => EventStatus, {
    foreignKey: 'eventStatusId'
  })
  public eventStatus: BelongsTo<typeof EventStatus>

  @column()
  public createdByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'createdByUserId'
  })
  public createdBy: BelongsTo<typeof User>

  @manyToMany(() => EventSession, {
    pivotTable: 'event_sessions_events',
    localKey: 'id',
    pivotForeignKey: 'eventId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'eventSessionId',
  })
  declare eventSessions: ManyToMany<typeof EventSession>

  @hasMany(() => Convocation, {
    foreignKey: 'eventId'
  })
  public convocations: HasMany<typeof Convocation>

  @hasMany(() => Scout, {
    foreignKey: 'eventId'
  })
  public scouts: HasMany<typeof Scout>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
