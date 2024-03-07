import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('preferences')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('preferences')
    })
  }
}
