import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string([
      rules.email()
    ]),
    password: schema.string([
      rules.minLength(6)
    ]),
    firstname: schema.string([
      rules.maxLength(255)
    ]),
    lastname: schema.string([
      rules.maxLength(255)
    ]),
    color: schema.string.nullableAndOptional([
      rules.maxLength(12)
    ]),
    textColor: schema.string.nullableAndOptional([
      rules.maxLength(12)
    ]),
  })

  public messages: CustomMessages = {}
}
