import Team from 'App/Models/Team';
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import type { Action, Resource } from 'App/managers/authorization.manager';
import Teammate from './Teammate';

export type GroupCans = {
  [resource in Resource]?: {
    [action in Action<resource>]?: boolean
  }
}

export default class Group extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public cans: GroupCans
  
  @column()
  public convocable: boolean

  @column()
  public teamId: number

  @belongsTo(() => Team, {
    foreignKey: 'teamId'
  })
  public team: BelongsTo<typeof Team>

  @hasMany(() => Teammate, {
    foreignKey: 'groupId'
  })
  public teammates: HasMany<typeof Teammate>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}