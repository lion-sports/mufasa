import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teammates'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('defaultRole')
      table.specificType('availableRoles', 'VARCHAR(255)[]')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('defaultRole')
      table.dropColumn('availableRoles')
    })
  }
}
