import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'join_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type')
      table.string('status')
      table.integer('userId').references('users.id').onDelete('CASCADE')
      table.integer('clubId').references('clubs.id').onDelete('CASCADE')

      table.timestamp('createdAt')
      table.timestamp('updatedAt')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}