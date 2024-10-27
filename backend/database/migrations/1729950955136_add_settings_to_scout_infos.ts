import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'scout_infos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('settings')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('settings')
    })
  }
}
