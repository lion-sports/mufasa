import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'

export default class CreateScoutValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    sport: schema.enum(SPORTS),
    name: schema.string(),
    startedAt: schema.date.optional(),
    eventId: schema.number()
  })

  public messages: CustomMessages = {}
}
