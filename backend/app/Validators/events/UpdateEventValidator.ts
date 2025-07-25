import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class UpdateEventValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    id: schema.number(),
    start: schema.date.nullableAndOptional(),
    end: schema.date.nullableAndOptional(),
    name: schema.string.nullableAndOptional([
      rules.maxLength(255)
    ]),
    eventStatusId: schema.number.nullableAndOptional(),
    description: schema.string.nullableAndOptional(),
    updateAllFrequency: schema.boolean.nullableAndOptional()
  })

  public messages: CustomMessages = {}
}
