import User from '#app/Models/User';
import Event from './Event.js';
import { DateTime } from 'luxon'
import { column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { type BelongsTo, type ManyToMany } from "@adonisjs/lucid/types/relations";
import Team from './Team.js';
import EventSession from './EventSession.js';

export const AGGREGATION_STRATEGY_TYPES = ['manual', 'date'] as const
export type AggregationStrategyType = typeof AGGREGATION_STRATEGY_TYPES[number]

export default class AggregationStrategy extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public eventSessionId: number

  @belongsTo(() => EventSession, {
    foreignKey: 'eventSessionId'
  })
  public eventSession: BelongsTo<typeof EventSession>

  @column()
  public type: AggregationStrategyType

  @column.dateTime()
  public fromDate: DateTime

  @column.dateTime()
  public toDate: DateTime

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
