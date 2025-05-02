import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime, } from 'luxon'
import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from '#app/Models/User'
import Team from '#app/Models/Team'
import Group from '#app/Models/Group'
import Shirt from './Shirt.js'
import { type HasMany } from "@adonisjs/lucid/types/relations";
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

export const VOLLEYBALL_ROLES = ['setter', 'outsideHitter', 'oppositeHitter', 'middleBlocker', 'libero'] as const
export const BASKETBALL_ROLES = ['pointGuard', 'shootingGuard', 'smallForward', 'powerForward', 'center'] as const
export const ROLES = [
  ...VOLLEYBALL_ROLES,
  ...BASKETBALL_ROLES
]
export type VolleyballRole = typeof VOLLEYBALL_ROLES[number]
export type BasketballRole = typeof BASKETBALL_ROLES[number]
export type Role = typeof ROLES[number]

export default class Teammate extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public alias: string

  @column()
  public defaultRole: Role

  @column()
  public availableRoles: Role[]

  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId'
  })
  public user: BelongsTo<typeof User>

  @column()
  public teamId: number

  @belongsTo(() => Team, {
    foreignKey: 'teamId'
  })
  public team: BelongsTo<typeof Team>

  @hasMany(() => Shirt, {
    foreignKey: 'teammateId'
  })
  declare shirts: HasMany<typeof Shirt>

  @column()
  public groupId: number

  @belongsTo(() => Group, {
    foreignKey: 'groupId'
  })
  public group: BelongsTo<typeof Group>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
