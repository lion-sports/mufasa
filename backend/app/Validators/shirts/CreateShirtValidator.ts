import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateShirtValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    number: schema.number(),
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    primaryColor: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    secondaryColor: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    teammateId: schema.number()
  })

  public messages: CustomMessages = {}
}
