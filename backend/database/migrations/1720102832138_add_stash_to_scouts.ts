import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'scouts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('stash')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stash')
    })
  }
}
