import db from '@adonisjs/lucid/services/db'
import Group from '#app/Models/Group'
import { BaseCommand } from "@adonisjs/core/ace";
import string from "@adonisjs/core/helpers/string";
import { CommandOptions } from "@adonisjs/core/types/ace";

export default class FixGroupsResourceCasing extends BaseCommand {
  public static commandName = 'task:fix_groups_resource_casing'
  public static description = ''
    static options: CommandOptions = {
          loadApp: true,
          staysAlive: false,
        };

  public async run() {
    let trx = await db.transaction()

    let groups = await Group.query({ client: trx })
    for(let i = 0; i < groups.length; i += 1) {
      let group = groups[i]
      if(!!group.cans) {
        for(const [resource, actions] of Object.entries(group.cans)) {
          let rightCasingResourceName = string.camelCase(resource) as keyof typeof group.cans
          if (rightCasingResourceName !== resource && !group.cans[rightCasingResourceName]) {
            console.log({ resource, rightCasingResourceName })
            // @ts-ignore
            group.cans[rightCasingResourceName] = group.cans[resource]
            // @ts-ignore
            delete group.cans[resource]
          }
        }
        await group.save()
      }
    }

    await trx.commit()
  }
}
