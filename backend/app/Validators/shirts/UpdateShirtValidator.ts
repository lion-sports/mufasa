import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateShirtValidator {
  constructor(protected ctx?: HttpContextContract) { }

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
