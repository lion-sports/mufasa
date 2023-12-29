import { CamelCaseBaseModel } from './CamelCaseBaseModel';
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Role from 'App/Models/Role';

export default class User extends CamelCaseBaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public firstname: string

  @column()
  public lastname: string

  @column()
  public phoneNumber: string

  @column()
  public system: boolean

  @column()
  public roleId: number

  @belongsTo(() => Role, {
    foreignKey: 'roleId'
  })
  public role: BelongsTo<typeof Role>

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
