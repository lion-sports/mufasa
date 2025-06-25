import Group from '#app/Models/Group';
import User from '#app/Models/User';
import Invitation from '#app/Models/Invitation';
import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js';
import { belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Teammate from './Teammate.js'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";
import { type ManyToMany } from "@adonisjs/lucid/types/relations";
import Club from './Club.js';
import { Sport } from 'lionn-common';
import EventStatus from './EventStatus.js';

export default class Team extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public name: string

  @column()
  public notes?: string | null

  @column()
  public sport?: Sport | null

  @hasMany(() => Teammate, {
    foreignKey: 'teamId'
  })
  public teammates: HasMany<typeof Teammate>

  @hasMany(() => Group, {
    foreignKey: 'teamId'
  })
  public groups: HasMany<typeof Group>

  @hasMany(() => Invitation, {
    foreignKey: 'teamId'
  })
  public invitations: HasMany<typeof Invitation>

  @hasMany(() => EventStatus, {
    foreignKey: 'teamId'
  })
  public eventStatuses: HasMany<typeof EventStatus>

  @column()
  public ownerId: number

  @belongsTo(() => User, {
    foreignKey: 'ownerId'
  })
  public owner: BelongsTo<typeof User>

  @column()
  public clubId: number | null

  @belongsTo(() => Club, {
    foreignKey: 'clubId'
  })
  public club: BelongsTo<typeof Club>

  @manyToMany(() => User, {
    localKey: 'id',
    pivotTable: 'teammates',
    pivotForeignKey: 'teamId',
    pivotRelatedForeignKey: 'userId',
    relatedKey: 'id'
  })
  public teammateUsers: ManyToMany<typeof User>

  @column()
  public preferences: {
    confirmPresenceByDefault?: boolean
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
