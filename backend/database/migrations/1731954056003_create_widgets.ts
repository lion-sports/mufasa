import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'widgets'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('componentName')
      table.integer('height')
      table.integer('width')
      table.integer('left')
      table.integer('top')
      table.jsonb('options')
      table.integer('dashboardId').references('dashboards.id').onDelete('CASCADE')
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
