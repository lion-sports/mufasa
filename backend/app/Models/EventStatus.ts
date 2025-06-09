import { DateTime } from 'luxon'
import { column, belongsTo } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import Team from './Team.js';

export default class EventStatus extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public color: string

  @column()
  public teamId: number

  @belongsTo(() => Team, {
    foreignKey: 'teamId'
  })
  public team: BelongsTo<typeof Team>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
