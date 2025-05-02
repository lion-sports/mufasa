import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'scouts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('scoringSystemId').references('scoring_systems.id').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('scoringSystemId')
    })
  }
}
