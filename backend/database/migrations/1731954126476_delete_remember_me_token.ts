import { BaseSchema } from "@adonisjs/lucid/schema";

export default class ApiTokens extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('rememberMeToken')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.string('rememberMeToken')
    })
  }
}

