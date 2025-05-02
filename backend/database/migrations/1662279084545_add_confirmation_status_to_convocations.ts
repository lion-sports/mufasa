import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'convocations'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('confirmationStatus', 255)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('confirmationStatus')
    })
  }
}
