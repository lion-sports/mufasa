import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'players'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('convocationId').references('convocations.id').onDelete('SET NULL')
      table.integer('teammateId').references('teammates.id').onDelete('SET NULL')
      table.specificType('aliases', 'VARCHAR(255)[]')
      table.integer('shirtId').references('shirts.id').onDelete('SET NULL')
      table.integer('shirtNumber')
      table.string('shirtPrimaryColor')
      table.string('shirtSecondaryColor')
      table.integer('scoutId').references('scouts.id').onDelete('SET NULL')
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
