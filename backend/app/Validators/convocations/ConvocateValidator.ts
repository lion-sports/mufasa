import { schema } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class ConvocateValidator {
  constructor(protected ctx?: HttpContext) { }

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
