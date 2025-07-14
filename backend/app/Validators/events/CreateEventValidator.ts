import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateEventValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    start: schema.date(),
    end: schema.date(),
    name: schema.string([
      rules.maxLength(255)
    ]),
    description: schema.string.nullableAndOptional(),
    eventStatusId: schema.number.nullableAndOptional(),
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
