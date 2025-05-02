import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { SPORTS } from '#app/Models/Scout'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateScoringSystemValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    public: schema.boolean.optional(),
    name: schema.string(),
    sport: schema.enum(SPORTS),
    config: schema.object().anyMembers(),
    createdForTeamId: schema.number.optional()
  })

  public messages: CustomMessages = {}
}
