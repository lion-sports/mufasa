import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class UpdateShirtValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    id: schema.number(),
    number: schema.number.optional(),
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    primaryColor: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    secondaryColor: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    teammateId: schema.number.optional()
  })

  public messages: CustomMessages = {}
}
