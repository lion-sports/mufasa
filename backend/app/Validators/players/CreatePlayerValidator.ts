import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ROLES } from 'App/Models/Teammate'

export default class CreatePlayerValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    scoutId: schema.number.optional(),
    convocationId: schema.number.optional(),
    teammateId: schema.number.optional(),
    aliases: schema.array.optional().members(schema.string([
      rules.maxLength(255)
    ])),
    role: schema.enum.optional(ROLES),
    shirtId: schema.number.optional(),
    isOpponent: schema.boolean.optional()
  })

  public messages: CustomMessages = {}
}
