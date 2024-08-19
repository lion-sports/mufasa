import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import { DateTime } from 'luxon'
import { belongsTo, BelongsTo, hasMany, HasMany, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Event from 'App/Models/Event'
import Player, { ScoutEventPlayer } from './Player'
import ScoringSystem from './ScoringSystem'
import ScoutInfo from './ScoutInfo'
import { VolleyballPhase, VolleyballPlayersDynamicPosition, VolleyballPlayersPosition, VolleyballPoints } from 'App/managers/scout/events/volleyball/common'
import { LiberoSubstitutionScoutEventJson } from 'App/managers/scout/events/volleyball/LiberoSubstitutionScoutEvent'

export const SPORTS = ['volleyball', 'basketball'] as const
export type Sport = typeof SPORTS[number]

export type VolleyballScoutStash = {
  points?: VolleyballPoints,
  playersServePositions?: VolleyballPlayersPosition,
  playersReceivePositions?: VolleyballPlayersDynamicPosition,
  playersDefenseBreakPositions?: VolleyballPlayersPosition,
  playersDefenseSideOutPositions?: VolleyballPlayersPosition,
  currentSetSubstitutionsMade?: {
    friends: {
      playerIn: ScoutEventPlayer,
      playerOut: ScoutEventPlayer
    }[]
    enemy: {
      playerIn: ScoutEventPlayer,
      playerOut: ScoutEventPlayer
    }[]
  },
  currentSetOpenLiberoSubstitution?: LiberoSubstitutionScoutEventJson[],
  currentSetTimeoutsCalled?: {
    friends: number
    enemy: number
  },
  phase?: VolleyballPhase
}

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
