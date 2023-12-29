import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer('roleId').references('roles.id').onDelete('SET NULL')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('roleId')
    })
  }
}
