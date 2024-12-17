import { CamelCaseBaseModel } from './CamelCaseBaseModel';
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import Encryption from '@ioc:Adonis/Core/Encryption'
import { column, beforeSave, manyToMany, ManyToMany, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Team from 'App/Models/Team';
import Dashboard from './Dashboard';

export default class User extends CamelCaseBaseModel {

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public avatarUrl?: string

  @column()
  public name?: string

  @column()
  public firstname?: string

  @column()
  public lastname?: string

  @column()
  public color?: string

  @column()
  public textColor?: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column({ serializeAs: null })
  public googleToken: string

  @column()
  public solanaPublicKey: string

  @column()
  public solanaPrivateKey: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Team, {
    pivotTable: 'teammates',
    localKey: 'id',
    pivotForeignKey: 'userId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'teamId',
  })
  public teams: ManyToMany<typeof Team>

  @hasMany(() => Team, {
    localKey: 'id',
    foreignKey: 'ownerId',
  })
  public ownedTeams: HasMany<typeof Team>

  @hasMany(() => Dashboard, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public dashboards: HasMany<typeof Dashboard>

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeSave()
  public static async encryptGoogleToken(user: User) {
    if (user.$dirty.googleToken) {
      user.googleToken = await Encryption.encrypt(user.googleToken)
    }
  }

  public getDecryptedGoogleToken(): string | null {
    return Encryption.decrypt(this.googleToken)
  }

  // @beforeSave()
  // public static async encryptSolanaPrivateKey(user: User) {
  //   if (user.$dirty.solanaPrivateKey) {
  //     user.solanaPrivateKey = await Encryption.encrypt(user.solanaPrivateKey)
  //   }
  // }

  // public getDecryptedSolanaPrivateKey(): string | null {
  //   return Encryption.decrypt(this.solanaPrivateKey)
  // }
}
