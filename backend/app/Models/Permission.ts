import { DateTime } from 'luxon'
import { column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import Role from './Role'

export default class Permission extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public action: string

  @column()
  public resource: string

  @manyToMany(() => Role, {
    pivotTable: 'permission_role',
    localKey: 'id',
    pivotForeignKey: 'permissionId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'roleId'
  })
  public roles: ManyToMany<typeof Role>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
