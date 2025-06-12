import { DateTime } from 'luxon'
import { column } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'

export default class Media extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public filename: string

  @column()
  public size: number

  @column()
  public driveName: string

  @column()
  public mime: string

  @column.dateTime()
  public lastRequested: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
