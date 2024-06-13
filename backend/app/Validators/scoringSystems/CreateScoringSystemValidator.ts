import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'

export default class CreateScoringSystemValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    public: schema.boolean.optional(),
    name: schema.string(),
    sport: schema.enum(SPORTS),
    config: schema.object().anyMembers(),
    createdForTeamId: schema.number.optional()
  })

  public messages: CustomMessages = {}
}
