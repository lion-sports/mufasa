import { schema, rules } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";
import { SPORTS } from 'lionn-common';

export default class UserValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    name: schema.string.optional([
      rules.maxLength(255)
    ]),
    notes: schema.string.nullableAndOptional(),
    sport: schema.enum.nullableAndOptional(SPORTS)
  })

  public messages: CustomMessages = {}
}
