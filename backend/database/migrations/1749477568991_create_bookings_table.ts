import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('placeId').references('places.id').onDelete('CASCADE')
      table.integer('createdByUserId').references('users.id').onDelete('CASCADE')
      table.timestamp('from')
      table.timestamp('to')
      table.string('status')
      table.timestamp('createdAt')
      table.timestamp('updatedAt')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}