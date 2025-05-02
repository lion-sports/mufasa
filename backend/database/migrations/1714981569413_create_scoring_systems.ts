import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'scoring_systems'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('public').defaultTo(false)
      table.string('name')
      table.string('sport')
      table.jsonb('config')
      table.integer('createdForTeamId').references('teams.id').onDelete('SET NULL')
      table.integer('createdByUserId').references('users.id').onDelete('SET NULL')
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
