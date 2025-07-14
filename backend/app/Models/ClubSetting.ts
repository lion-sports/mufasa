import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { belongsTo, column } from '@adonisjs/lucid/orm'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import Club from './Club.js';

export const CLUB_SETTING_KEYS = [
  'bookingsActive',
  'bookingsConfirmationRequired'
] as const
export type ClubSettingKey = typeof CLUB_SETTING_KEYS[number]
type ClubSettingStructure = {
  [Key in ClubSettingKey]?: ClubSettingStructureDefinition[Key] | undefined | null
}
export type ClubSettingStructureDefinition = {
  bookingsActive: boolean,
  bookingsConfirmationRequired: boolean
}

export default class ClubSetting extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public settings: ClubSettingStructure

  @column()
  public clubId: number

  @belongsTo(() => Club, {
    foreignKey: 'clubId'
  })
  public club: BelongsTo<typeof Club>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
