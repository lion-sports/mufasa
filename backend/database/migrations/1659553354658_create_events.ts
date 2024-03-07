import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('start', { useTz: true })
      table.timestamp('end', { useTz: true })
      table.string('name')
      table.text('description')
      table.string('status')
      table.integer('frequencyId').references('frequencies.id').onDelete('CASCADE')
      table.integer('teamId').references('teams.id').onDelete('CASCADE')

      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
