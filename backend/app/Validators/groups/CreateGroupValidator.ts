import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateGroupValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    name: schema.string([
      rules.maxLength(255)
    ]),
    team: schema.object().members({
      id: schema.number()
    }),
    cans: schema.object.optional().anyMembers()
  })

  public messages: CustomMessages = {}
}
