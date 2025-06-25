import User from '#app/Models/User';
import Event from './Event.js';
import { DateTime } from 'luxon'
import { column, belongsTo, manyToMany, hasOne } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { type HasOne, type BelongsTo, type ManyToMany } from "@adonisjs/lucid/types/relations";
import Team from './Team.js';
import AggregationStrategy from './AggregationStrategy.js';
import EventStatus from './EventStatus.js';

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

  @hasOne(() => AggregationStrategy, {
    foreignKey: 'eventSessionId'
  })
  public aggregationStrategy: HasOne<typeof AggregationStrategy>

  @manyToMany(() => Event, {
    pivotTable: 'event_sessions_events',
    localKey: 'id',
    pivotForeignKey: 'eventSessionId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'eventId',
  })
  public events: ManyToMany<typeof Event>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
