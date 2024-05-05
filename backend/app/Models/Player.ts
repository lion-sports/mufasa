import { CamelCaseBaseModel } from './CamelCaseBaseModel'
import { DateTime } from 'luxon'
import { belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Shirt from './Shirt'
import Convocation from './Convocation'
import Teammate from './Teammate'
import Scout from './Scout'

export default class Player extends CamelCaseBaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public convocationId: number

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
  public teammateId: number

  @belongsTo(() => Teammate, {
    foreignKey: 'teammateId'
  })
  public teammate: BelongsTo<typeof Teammate>

  @column()
  public aliases: string[]

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
