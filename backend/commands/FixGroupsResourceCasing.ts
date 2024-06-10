import { BaseCommand } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'
import Group from 'App/Models/Group'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class FixGroupsResourceCasing extends BaseCommand {
  public static commandName = 'task:fix_groups_resource_casing'
  public static description = ''

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    let trx = await Database.transaction()

    let groups = await Group.query({ client: trx })
    for(let i = 0; i < groups.length; i += 1) {
      let group = groups[i]
      if(!!group.cans) {
        for(const [resource, actions] of Object.entries(group.cans)) {
          let rightCasingResourceName = string.camelCase(resource)
          if (rightCasingResourceName !== resource && !group.cans[rightCasingResourceName]) {
            console.log({ resource, rightCasingResourceName })
            group.cans[rightCasingResourceName] = group.cans[resource]
            delete group.cans[resource]
          }
        }
        await group.save()
      }
    }

    await trx.commit()
  }
}
