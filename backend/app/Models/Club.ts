import { DateTime } from 'luxon'
import { belongsTo, column, hasMany, hasManyThrough, hasOne } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import type { Sport } from 'lionn-common'
import Media from './Media.js'
import type { BelongsTo, HasMany, HasManyThrough, HasOne } from '@adonisjs/lucid/types/relations'
import User from './User.js'
import Group from './Group.js'
import Member from './Member.js'
import Team from './Team.js'
import Place from './Place.js'
import ClubSetting from './ClubSetting.js'
import Booking from './Booking.js'

export default class Club extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public completeName: string

  @column()
  public bio?: string | null

  @column()
  public sport: Sport

  @column()
  public public: boolean

  @column()
  public logoMediaId: number | null

  @belongsTo(() => Media, {
    foreignKey: 'logoMediaId'
  })
  public logo: BelongsTo<typeof Media>

  @column()
  public headerMediaId: number | null

  @belongsTo(() => Media, {
    foreignKey: 'headerMediaId'
  })
  public header: BelongsTo<typeof Media>

  @column()
  public ownerId: number | null

  @belongsTo(() => User, {
    foreignKey: 'ownerId'
  })
  public owner: BelongsTo<typeof User>

  @hasMany(() => Group, {
    foreignKey: 'clubId'
  })
  public groups: HasMany<typeof Group>

  @hasManyThrough([() => Booking, () => Place])
  public bookings: HasManyThrough<typeof Booking>

  @hasMany(() => Team, {
    foreignKey: 'clubId'
  })
  public teams: HasMany<typeof Team>

  @hasMany(() => Member, {
    foreignKey: 'clubId'
  })
  public members: HasMany<typeof Member>

  @hasMany(() => Place, {
    foreignKey: 'clubId'
  })
  public places: HasMany<typeof Place>

  @hasOne(() => ClubSetting, {
    foreignKey: 'clubId',
  })
  declare setting: HasOne<typeof ClubSetting>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}