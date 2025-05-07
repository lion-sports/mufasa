import { DateTime } from 'luxon'
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import type { Sport } from 'lionn-common'
import Media from './Media.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './User.js'
import Group from './Group.js'
import Member from './Member.js'

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
  public logoMediaId: number | null

  @belongsTo(() => Media, {
    foreignKey: 'logoMediaId'
  })
  public logo: BelongsTo<typeof Media>

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

  @hasMany(() => Member, {
    foreignKey: 'clubId'
  })
  public members: HasMany<typeof Member>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}