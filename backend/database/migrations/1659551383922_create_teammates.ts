import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teammates'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('uid')
      table.integer('userId').references('users.id').onDelete('CASCADE')
      table.integer('teamId').references('teams.id').onDelete('CASCADE')
      table.integer('roleId').references('roles.id').onDelete('SET NULL')

      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
