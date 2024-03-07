import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SetRoleValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number(),
    alias: schema.string.nullableAndOptional(),
    roleId: schema.number.nullableAndOptional()
  })

  public messages: CustomMessages = {}
}
