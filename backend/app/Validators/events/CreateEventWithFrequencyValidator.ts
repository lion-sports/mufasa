import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateWithFrequencyEventValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    event: schema.object().members({
      start: schema.date(),
      end: schema.date(),
      name: schema.string([
        rules.maxLength(255)
      ]),
      description: schema.string.nullableAndOptional(),
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
