import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'shirts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('number')
      table.string('name')
      table.string('primaryColor')
      table.string('secondaryColor')
      table.integer('teammateId').references('teammates.id').onDelete('CASCADE')
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
