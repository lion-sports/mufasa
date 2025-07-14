import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('teamId').references('teams.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('teamId')
    })
  }
}