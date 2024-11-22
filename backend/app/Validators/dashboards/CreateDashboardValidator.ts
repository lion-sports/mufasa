import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateDashboardValidator {
  constructor(protected ctx?: HttpContextContract) {}

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
