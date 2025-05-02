import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class UpdateGroupValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    id: schema.number(),
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    cans: schema.object.optional().anyMembers()
  })

  public messages: CustomMessages = {}
}
