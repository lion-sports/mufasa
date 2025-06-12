import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";
import { SPORTS } from 'lionn-common';

export default class UpdateShirtValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    id: schema.number(),
    public: schema.boolean.optional(),
    name: schema.string.optional(),
    sport: schema.enum.optional(SPORTS),
    config: schema.object.optional().anyMembers(),
  })

  public messages: CustomMessages = {}
}
