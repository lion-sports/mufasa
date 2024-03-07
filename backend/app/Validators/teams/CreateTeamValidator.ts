import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TeamValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string([
      rules.maxLength(255)
    ]),
    notes: schema.string.nullableAndOptional(),
    owner: schema.object().members({
      id: schema.number()
    })
  })

  public messages: CustomMessages = {}
}
