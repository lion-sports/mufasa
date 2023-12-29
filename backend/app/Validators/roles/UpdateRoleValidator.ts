import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateRoleValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    considerGallop: schema.boolean.nullableAndOptional(),
    considerReferent: schema.boolean.nullableAndOptional(),
    permissions: schema.array.nullableAndOptional().members(
      schema.object().members({
        id: schema.number()
      })
    )
  })


  public messages: CustomMessages = {}
}
