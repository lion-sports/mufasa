import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Permission from 'App/Models/Permission'

export default class extends BaseSeeder {
  public async run () {
    await Permission.fetchOrCreateMany([
        'resource', 
        'action'
      ], [
        {
          resource: 'user',
          action: 'manage'
        },
        {
          resource: 'user',
          action: 'view'
        },
        {
          resource: 'role',
          action: 'manage'
        },
        {
          resource: 'preference',
          action: 'manage'
        },
        {
          resource: 'section',
          action: 'manage'
        },
        {
          resource: 'section',
          action: 'view'
        },
        {
          resource: 'sheetModel',
          action: 'manage'
        },
        {
          resource: 'committee',
          action: 'fill'
        },
        {
          resource: 'committee',
          action: 'assignSubstitutes'
        },
        {
          resource: 'sheet',
          action: 'view'
        },
        {
          resource: 'sheet',
          action: 'fill'
        },
        {
          resource: 'sheet',
          action: 'fillAssigned'
        },
        {
          resource: 'sheet',
          action: 'validate'
        },
        {
          resource: 'sheet',
          action: 'validateAssigned'
        },
        {
          resource: 'sheet',
          action: 'publish'
        },
        {
          resource: 'comunicationModel',
          action: 'manage'
        },
        {
          resource: 'comunication',
          action: 'manage'
        },
        {
          resource: 'election',
          action: 'manage'
        },
        {
          resource: 'election',
          action: 'seed'
        },
        {
          resource: 'election',
          action: 'exportPresidents'
        },
        {
          resource: 'election',
          action: 'exportPrefecture'
        }
      ]
    )
  }
}
