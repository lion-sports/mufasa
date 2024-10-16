import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ROLES } from 'App/Models/Teammate'

export default class UpdatePlayerValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    aliases: schema.array.optional().members(schema.string.optional([
      rules.maxLength(255)
    ])),
    shirtId: schema.number.optional(),
    role: schema.enum.optional(ROLES),
    shirtNumber: schema.number.optional(),
    shirtPrimaryColor: schema.string.optional(),
    shirtSecondaryColor: schema.string.optional(),
    isOpponent: schema.boolean.optional()
  })

  public messages: CustomMessages = {}
}
