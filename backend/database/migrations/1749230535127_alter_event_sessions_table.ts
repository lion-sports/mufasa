import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('eventStatusId').references('event_statuses.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('eventStatusId')
    })
  }
}