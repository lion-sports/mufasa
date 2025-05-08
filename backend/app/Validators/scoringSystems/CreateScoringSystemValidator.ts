import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";
import { SPORTS } from 'lionn-common';

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
