import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Frequency from '#app/Models/Frequency'
import Team from '#app/Models/Team'
import User from '#app/Models/User'
import Convocation from '#app/Models/Convocation'
import Scout from './Scout.js'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";
import { type HasMany } from "@adonisjs/lucid/types/relations";

export default class Event extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime()
  public start: DateTime

  @column.dateTime()
  public end: DateTime

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public status: 'confirmed' | 'notConfirmed'

  @column()
  public frequencyId: number

  @belongsTo(() => Frequency, {
    foreignKey: 'frequencyId'
  })
  public frequency: BelongsTo<typeof Frequency>

  @column()
  public teamId: number

  @belongsTo(() => Team, {
    foreignKey: 'teamId'
  })
  public team: BelongsTo<typeof Team>

  @column()
  public createdByUserId: number

  @belongsTo(() => User, {
    foreignKey: 'createdByUserId'
  })
  public createdBy: BelongsTo<typeof User>

  @hasMany(() => Convocation, {
    foreignKey: 'eventId'
  })
  public convocations: HasMany<typeof Convocation>

  @hasMany(() => Scout, {
    foreignKey: 'eventId'
  })
  public scouts: HasMany<typeof Scout>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
