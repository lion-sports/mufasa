import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateGroupValidator {
  constructor(protected ctx?: HttpContextContract) { }

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
