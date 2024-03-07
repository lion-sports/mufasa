import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ConvocateValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    teammates: schema.array().members(
      schema.object().members({
        id: schema.number()
      })
    ),
    event: schema.object().members({
      id: schema.number()
    }),
    notes: schema.string.nullableAndOptional()
  })

  public messages: CustomMessages = {}
}
