import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePlayerValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    scoutId: schema.number.optional(),
    convocationId: schema.number.optional(),
    teammateId: schema.number.optional(),
    aliases: schema.array.optional().members(schema.string([
      rules.maxLength(255)
    ])),
    shirtId: schema.number.optional(),
  })

  public messages: CustomMessages = {}
}
