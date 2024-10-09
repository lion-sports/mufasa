import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel';
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Scout from './Scout';

export type ScoutInfoGeneral = {
  opponent?: {
    name?: string
  },
  friendsFieldSide?: 'right' | 'left'
}

export default class ScoutInfo extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public number: number

  @column()
  public general?: ScoutInfoGeneral

  @column()
  public scoutId: number

  @belongsTo(() => Scout, {
    foreignKey: 'scoutId'
  })
  public scout: BelongsTo<typeof Scout>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
