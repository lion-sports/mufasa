import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateEventValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number(),
    start: schema.date.nullableAndOptional(),
    end: schema.date.nullableAndOptional(),
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    description: schema.string.nullableAndOptional(),
    status: schema.enum.nullableAndOptional(['confirmed', 'notConfirmed']),
    updateAllFrequency: schema.boolean.nullableAndOptional()
  })

  public messages: CustomMessages = {}
}
