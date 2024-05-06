import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'

export default class UpdateShirtValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number(),
    public: schema.boolean.optional(),
    name: schema.string.optional(),
    sport: schema.enum.optional(SPORTS),
    config: schema.object.optional().anyMembers(),
  })

  public messages: CustomMessages = {}
}
