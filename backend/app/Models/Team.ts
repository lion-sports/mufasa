import Role from 'App/Models/Role';
import User from 'App/Models/User';
import Invitation from 'App/Models/Invitation';
import { DateTime } from 'luxon'
import { CamelCaseBaseModel } from './CamelCaseBaseModel';
import { BelongsTo, belongsTo, column, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Teammate from './Teammate'

export default class Team extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public name: string

  @column()
  public notes: string

  @hasMany(() => Teammate, {
    foreignKey: 'teamId'
  })
  public teammates: HasMany<typeof Teammate>

  @hasMany(() => Role, {
    foreignKey: 'teamId'
  })
  public roles: HasMany<typeof Role>

  @hasMany(() => Invitation, {
    foreignKey: 'teamId'
  })
  public invitations: HasMany<typeof Invitation>

  @column()
  public ownerId: number

  @belongsTo(() => User, {
    foreignKey: 'ownerId'
  })
  public owner: BelongsTo<typeof User>

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
