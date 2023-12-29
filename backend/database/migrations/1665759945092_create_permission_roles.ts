import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'permission_role'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('roleId').unsigned().references('roles.id').onDelete('CASCADE')
      table.integer('permissionId').unsigned().references('permissions.id').onDelete('CASCADE')
      table.unique(['roleId', 'permissionId'])
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}