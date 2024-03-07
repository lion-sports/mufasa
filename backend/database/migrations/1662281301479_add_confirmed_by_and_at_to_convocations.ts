import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'convocations'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('confirmedByUserId').references('users.id').onDelete('SET NULL')
      table.timestamp('updateConfirmationAt', { useTz: true })
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('confirmedByUserId')
      table.dropColumn('updateConfirmationAt')
    })
  }
}
