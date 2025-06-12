import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clubs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('completeName')
      table.text('bio')
      table.string('sport')
      table.integer('logoMediaId').references('media.id').onDelete('SET NULL')
      table.integer('ownerId').references('users.id').onDelete('SET NULL')
      table.timestamp('createdAt')
      table.timestamp('updatedAt')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}