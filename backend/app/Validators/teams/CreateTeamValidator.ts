import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'

export default class TeamValidator {
  constructor(protected ctx?: HttpContextContract) {}

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
