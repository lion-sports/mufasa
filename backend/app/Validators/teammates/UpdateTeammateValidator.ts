import { schema } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomMessages } from "@adonisjs/validator/types";

export default class UpdateTeammateValidator {
  constructor(protected ctx?: HttpContext) { }

  public schema = schema.create({
    id: schema.number(),
    alias: schema.string.nullableAndOptional(),
    roleId: schema.number.nullableAndOptional()
  })

  public messages: CustomMessages = {}
}
