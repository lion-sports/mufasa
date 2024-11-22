import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateDashboardValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number(),
    name: schema.string.optional(),
    active: schema.boolean.optional(),
    widgets: schema.array.optional().members(
      schema.object().members({
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
