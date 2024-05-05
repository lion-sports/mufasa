import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePlayerValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    aliases: schema.array.optional().members(schema.string([
      rules.maxLength(255)
    ])),
    shirtId: schema.number.optional(),
  })

  public messages: CustomMessages = {}
}
