import { schema } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateDashboardValidator {
  constructor(protected ctx?: HttpContext) {}

  public schema = schema.create({
    name: schema.string(),
    active: schema.boolean.optional(),
    widgets: schema.array.optional().members(
      schema.object().members({
        componentName: schema.string(),
        height: schema.number(),
        width: schema.number(),
        left: schema.number(),
        top: schema.number(),
        options: schema.object.optional().anyMembers(),
      })
    ),
  })
  public messages: CustomMessages = {}
}
