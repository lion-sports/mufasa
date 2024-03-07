import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateWithFrequencyEventValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    event: schema.object().members({
      start: schema.date(),
      end: schema.date(),
      name: schema.string([
        rules.maxLength(255)
      ]),
      description: schema.string.nullableAndOptional(),
      status: schema.enum.nullableAndOptional(['confirmed', 'notConfirmed']),
      team: schema.object().members({
        id: schema.number()
      })
    }),
    rule: schema.object().members({
      frequency: schema.enum(['week', 'month']),
      from: schema.date(),
      to: schema.date(),
      daysOfWeek: schema.array.optional().members(schema.number([
        rules.range(1, 7)
      ])),
      daysOfMonth: schema.array.optional().members(schema.number([
        rules.range(1, 31)
      ]))
    })
  })

  public messages: CustomMessages = {}
}
