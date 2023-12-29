import { DateTime } from 'luxon'
import { column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import Permission from './Permission'

export default class Role extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public considerGallop: boolean

  @column()
  public considerReferent: boolean

  @manyToMany(() => Permission, {
    pivotTable: 'permission_role',
    localKey: 'id',
    pivotForeignKey: 'roleId',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'permissionId'
  })
  public permissions: ManyToMany<typeof Permission>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
