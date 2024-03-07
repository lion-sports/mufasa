import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'event_sessions'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('ownedByUserId').references('users.id').onDelete('CASCADE')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ownedByUserId')
    })
  }
}
