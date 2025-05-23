import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import encryption from '@adonisjs/core/services/encryption'
import { column, beforeSave, manyToMany, hasMany, hasOne, computed } from '@adonisjs/lucid/orm'
import Team from '#app/Models/Team'
import Dashboard from './Dashboard.js'
import { type ManyToMany } from '@adonisjs/lucid/types/relations'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import { type HasOne } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider, AccessToken } from '@adonisjs/auth/access_tokens'
import { compose } from '@adonisjs/core/helpers'
import Club from './Club.js'
import UserSetting from './UserSetting.js'

const AuthFinder = withAuthFinder(() => hash.use('argon'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(CamelCaseBaseModel, AuthFinder) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public avatarUrl?: string

  @column()
  public name?: string

  @column.dateTime()
  public birthday?: DateTime

  @column()
  public firstname?: string

  @column()
  public lastname?: string

  @computed()
  get fullname() {
    if (!!this.firstname && !!this.lastname) return `${this.firstname} ${this.lastname}`
    else if(!!this.name) return this.name
  }

  @column()
  public color?: string

  @column()
  public textColor?: string

  @column({ serializeAs: null })
  public password: string

  currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '24 hours',
    tokenSecretLength: 64,
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'api',
  })

  static confirmRegistrationToken = DbAccessTokensProvider.forModel(User, {
    expiresIn: '24 hours',
    tokenSecretLength: 64,
    prefix: 'reg_',
    table: 'auth_access_tokens',
    type: 'signup',
  })

  static resetPasswordTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '10 minutes',
    tokenSecretLength: 64,
    prefix: 'rpt_',
    table: 'auth_access_tokens',
    type: 'resetPassword',
  })

  static rememberMeTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '3 months',
    tokenSecretLength: 64,
    prefix: 'rem_',
    table: 'auth_access_tokens',
    type: 'rememberMe',
  })

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

  @manyToMany(() => Club, {
    pivotTable: 'members',
    localKey: 'id',
    pivotForeignKey: 'userId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'clubId',
  })
  public clubs: ManyToMany<typeof Club>

  @hasMany(() => Team, {
    localKey: 'id',
    foreignKey: 'ownerId',
  })
  public ownedTeams: HasMany<typeof Team>

  @hasMany(() => Club, {
    localKey: 'id',
    foreignKey: 'ownerId',
  })
  public ownedClubs: HasMany<typeof Club>

  @hasOne(() => UserSetting, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public userSetting: HasOne<typeof UserSetting>

  @hasMany(() => Dashboard, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public dashboards: HasMany<typeof Dashboard>

  @beforeSave()
  public static async encryptGoogleToken(user: User) {
    if (user.$dirty.googleToken) {
      user.googleToken = await encryption.encrypt(user.googleToken)
    }
  }

  public getDecryptedGoogleToken(): string | null {
    return encryption.decrypt(this.googleToken)
  }
}
