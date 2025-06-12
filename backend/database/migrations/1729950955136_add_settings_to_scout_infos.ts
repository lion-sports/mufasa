import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'scout_infos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.jsonb('settings')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('settings')
    })
  }
}
