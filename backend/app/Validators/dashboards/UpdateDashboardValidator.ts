import { schema } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class UpdateDashboardValidator {
  constructor(protected ctx?: HttpContext) {}

  public schema = schema.create({
    id: schema.number(),
    name: schema.string.optional(),
    active: schema.boolean.optional(),
    widgets: schema.array.optional().members(
      schema.object().members({
        id: schema.number.optional(),
        componentName: schema.string.optional(),
        height: schema.number.optional(),
        width: schema.number.optional(),
        left: schema.number.optional(),
        top: schema.number.optional(),
        options: schema.object.nullableAndOptional().anyMembers(),
      })
    ),
  })
  public messages: CustomMessages = {}
}
