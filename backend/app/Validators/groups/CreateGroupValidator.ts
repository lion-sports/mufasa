import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateGroupValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    name: schema.string([
      rules.maxLength(255)
    ]),
    team: schema.object().members({
      id: schema.number()
    })
  })

  public messages: CustomMessages = {}
}
