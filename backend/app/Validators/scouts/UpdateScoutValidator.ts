import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'

export default class UpdateScoutValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number.optional(),
    sport: schema.enum.optional(SPORTS),
    name: schema.string.optional(),
    startedAt: schema.date.optional(),
    eventId: schema.number.optional()
  })

  public messages: CustomMessages = {}
}
