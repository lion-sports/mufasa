import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teammates'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('alias')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('alias')
    })
  }
}
