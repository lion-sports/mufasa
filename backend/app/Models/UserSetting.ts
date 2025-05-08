import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { belongsTo, column } from '@adonisjs/lucid/orm'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import User from './User.js';

export const USER_SETTINGS_KEY = ['clubsSectionVisible'] as const
export type UserSettingKey = typeof USER_SETTINGS_KEY[number]
type UserSettingStructure = {
  [Key in UserSettingKey]: UserSettingStructureDefinition[Key] | undefined | null
}
export type UserSettingStructureDefinition = {
  clubsSectionVisible: boolean
}

export default class UserSetting extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public settings: UserSettingStructure

  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
