import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { ROLES } from '#app/Models/Teammate'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreatePlayerValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    scoutId: schema.number.optional(),
    convocationId: schema.number.optional(),
    teammateId: schema.number.optional(),
    aliases: schema.array.optional().members(schema.string([
      rules.maxLength(255)
    ])),
    role: schema.enum.optional(ROLES),
    shirtId: schema.number.optional(),
    shirtNumber: schema.number.optional(),
    shirtPrimaryColor: schema.string.optional(),
    shirtSecondaryColor: schema.string.optional(),
    isOpponent: schema.boolean.optional()
  })

  public messages: CustomMessages = {}
}
