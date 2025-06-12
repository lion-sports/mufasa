import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Scout from './Scout.js';
import type { ScoutInfoGeneral, ScoutInfoSettings } from 'lionn-common';
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

export default class ScoutInfo extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public number: number

  @column()
  public general?: ScoutInfoGeneral

  @column()
  public settings?: ScoutInfoSettings

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
