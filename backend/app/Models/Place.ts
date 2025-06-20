import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import Media from './Media.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Club from './Club.js'

export default class Place extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public address: string

  @column()
  public description: string

  @column()
  public coverId: number

  @belongsTo(() => Media, {
    foreignKey: 'coverId'
  })
  public cover: BelongsTo<typeof Media>

  @column()
  public clubId: number

  @belongsTo(() => Club, {
    foreignKey: 'clubId'
  })
  public club: BelongsTo<typeof Club>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}