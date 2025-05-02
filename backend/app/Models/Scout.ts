import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { belongsTo, hasMany, column, hasOne } from '@adonisjs/lucid/orm'
import Event from '#app/Models/Event'
import Player from './Player.js'
import ScoringSystem from './ScoringSystem.js'
import ScoutInfo from './ScoutInfo.js'
import type { VolleyballScoutStash } from 'lionn-common'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";
import { type HasOne } from "@adonisjs/lucid/types/relations";

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

  @hasMany(() => Player, {
    foreignKey: 'scoutId'
  })
  declare players: HasMany<typeof Player>

  @hasOne(() => ScoutInfo, {
    foreignKey: 'scoutId'
  })
  declare scoutInfo: HasOne<typeof ScoutInfo>

  @column()
  public scoringSystemId: number

  @column()
  public stash: VolleyballScoutStash

  @belongsTo(() => ScoringSystem, {
    foreignKey: 'scoringSystemId'
  })
  public scoringSystem: BelongsTo<typeof ScoringSystem>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
