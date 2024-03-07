import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateEventValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    start: schema.date(),
    end: schema.date(),
    name: schema.string([
      rules.maxLength(255)
    ]),
    description: schema.string.nullableAndOptional(),
    status: schema.enum.nullableAndOptional(['confirmed', 'notConfirmed']),
    team: schema.object().members({
      id: schema.number()
    }),
    convocations: schema.array.nullableAndOptional().members(
      schema.object().members({
        teammateId: schema.number()
      })
    )
  })

  public messages: CustomMessages = {}
}
