import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { SPORTS } from '#app/Models/Scout'
import { CustomMessages } from "@adonisjs/validator/types";

export default class TeamValidator {
  constructor(protected ctx?: HttpContext) {}

  public schema = schema.create({
    name: schema.string([
      rules.maxLength(255)
    ]),
    notes: schema.string.nullableAndOptional(),
    owner: schema.object().members({
      id: schema.number()
    }),
    sport: schema.enum.nullableAndOptional(SPORTS)
  })

  public messages: CustomMessages = {}
}
