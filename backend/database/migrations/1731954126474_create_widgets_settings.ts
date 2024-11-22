import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'widget_settings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.jsonb('settings')
      table.integer('widgetId').references('widgets.id').onDelete('CASCADE')
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
