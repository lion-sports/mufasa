import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'teams'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('sport')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sport')
    })
  }
}
