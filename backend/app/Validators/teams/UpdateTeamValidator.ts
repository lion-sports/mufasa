import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    notes: schema.string.nullableAndOptional(),
  })

  public messages: CustomMessages = {}
}
