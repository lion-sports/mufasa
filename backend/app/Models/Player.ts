import { CamelCaseBaseModel } from './CamelCaseBaseModel.js'
import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import Shirt from './Shirt.js'
import Convocation from './Convocation.js'
import Teammate, { type Role } from './Teammate.js'
import Scout from './Scout.js'
import { type BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Player extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public convocationId: number | null

  @belongsTo(() => Convocation, {
    foreignKey: 'convocationId'
  })
  public convocation: BelongsTo<typeof Convocation>

  @column()
  public scoutId: number

  @belongsTo(() => Scout, {
    foreignKey: 'scoutId'
  })
  public scout: BelongsTo<typeof Scout>

  @column()
  public teammateId: number | null

  @belongsTo(() => Teammate, {
    foreignKey: 'teammateId'
  })
  public teammate: BelongsTo<typeof Teammate>

  @column()
  public aliases: string[]

  @column()
  public role: Role

  @column()
  public shirtId: number

  @belongsTo(() => Shirt, {
    foreignKey: 'shirtId'
  })
  public shirt: BelongsTo<typeof Shirt>

  @column()
  public shirtNumber: number

  @column()
  public shirtPrimaryColor?: string | null

  @column()
  public shirtSecondaryColor?: string | null

  @column()
  public isOpponent: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
