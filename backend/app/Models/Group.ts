import Team from '#app/Models/Team';
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { Action, Resource } from '#app/managers/authorization.manager';
import Teammate from './Teammate.js';
import { type ManyToMany, type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";
import Club from './Club.js';
import User from './User.js';
import Member from './Member.js';

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

  @hasMany(() => Member, {
    foreignKey: 'groupId'
  })
  public members: HasMany<typeof Member>

  @manyToMany(() => User, {
    pivotTable: 'members',
    localKey: 'id',
    pivotForeignKey: 'groupId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'userId',
  })
  public membersUser: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'teammates',
    localKey: 'id',
    pivotForeignKey: 'groupId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'userId',
  })
  public teammatesUser: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}