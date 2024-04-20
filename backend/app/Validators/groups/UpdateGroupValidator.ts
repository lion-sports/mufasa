import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateGroupValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number(),
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
  })

  public messages: CustomMessages = {}
}
