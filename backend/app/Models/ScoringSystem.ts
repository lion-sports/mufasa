import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel';
import { belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { Sport } from './Scout';
import User from './User';
import Team from './Team';

export type ScoringSystemConfigPoints = {
  mode: 'totalPoints'
  totalPoints: number
} | {
  mode: 'winPoints'
  winPoints: number
  hasAdvantages: boolean
  pointsLimit?: number
}

export type ScoringSystemConfig = {
  set: {
    mode: 'totalSet'
    totalSets: number
  } | {
    mode: 'winSet'
    winSets: number
  },
  points: ScoringSystemConfigPoints,
  tieBreak?: ScoringSystemConfigPoints
}

export default class ScoringSystem extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public public: boolean

  @column()
  public sport: Sport

  @column()
  public createdByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'createdByUserId'
  })
  public createdByUser: BelongsTo<typeof User>

  @column()
  public createdForTeamId: number

  @belongsTo(() => Team, {
    foreignKey: 'createdForTeamId'
  })
  public createdForTeam: BelongsTo<typeof Team>

  @column()
  public config: ScoringSystemConfig

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
