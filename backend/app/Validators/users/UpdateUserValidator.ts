import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    email: schema.string.nullableAndOptional([
      rules.email()
    ]),
    password: schema.string.nullableAndOptional([
      rules.minLength(6)
    ]),
    firstname: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    lastname: schema.string.nullableAndOptional([
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
