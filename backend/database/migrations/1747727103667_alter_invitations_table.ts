import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('uid')
      table.text('token')
      table.timestamp('expirationDate')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('uid')
      table.dropColumn('token')
      table.dropColumn('expirationDate')
    })
  }
}