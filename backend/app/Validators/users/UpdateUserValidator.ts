import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    email: schema.string.nullableAndOptional(),
    password: schema.string.nullableAndOptional([
      rules.minLength(6)
    ]),
    phoneNumber: schema.string.nullableAndOptional()
  })

  public messages: CustomMessages = {}
}
