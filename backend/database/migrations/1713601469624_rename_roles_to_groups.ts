import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = 'roles'

  public async up () {
    this.schema.renameTable(this.tableName, 'groups')
  }

  public async down () {
    this.schema.renameTable('groups', this.tableName)
  }
}
