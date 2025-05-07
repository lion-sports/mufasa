import Team from '#app/Models/Team';
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { Action, Resource } from '#app/managers/authorization.manager';
import Teammate from './Teammate.js';
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";
import Club from './Club.js';

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

  @column()
  public clubId: number

  @belongsTo(() => Club, {
    foreignKey: 'clubId'
  })
  public club: BelongsTo<typeof Club>

  @hasMany(() => Teammate, {
    foreignKey: 'groupId'
  })
  public teammates: HasMany<typeof Teammate>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}