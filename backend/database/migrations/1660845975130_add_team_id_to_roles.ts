import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'roles'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('teamId').references('teams.id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('teamId')
    })
  }
}
