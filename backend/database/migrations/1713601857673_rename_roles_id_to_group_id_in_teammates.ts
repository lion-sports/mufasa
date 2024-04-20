import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teammates'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('roleId', 'groupId')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('groupId', 'roleId')
    })
  }
}
