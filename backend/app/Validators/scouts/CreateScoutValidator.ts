import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'
import { FRIENDS_FIELD_SIDES, POSSIBLE_AUTO_POINT_ENEMY_EVENTS, POSSIBLE_AUTO_POINT_FRIENDS_EVENTS } from 'App/Models/ScoutInfo'

export default class CreateScoutValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    sport: schema.enum(SPORTS),
    name: schema.string(),
    startedAt: schema.date.optional(),
    eventId: schema.number(),
    scoringSystemId: schema.number.optional(),
    scoutInfo: schema.object.optional().members({
      general: schema.object.optional().members({
        opponent: schema.object.optional().members({
          name: schema.string.optional()
        }),
        friendsFieldSide: schema.enum.optional(FRIENDS_FIELD_SIDES)
      }),
      settings: schema.object.optional().members({
        automations: schema.object.optional().members({
          autoPoint: schema.object.optional().members({
            friends: schema.array.optional().members(
              schema.enum(POSSIBLE_AUTO_POINT_FRIENDS_EVENTS)
            ),
            enemy: schema.array.optional().members(
              schema.enum(POSSIBLE_AUTO_POINT_ENEMY_EVENTS)
            )
          })
        }),
      })
    })
  })

  public messages: CustomMessages = {}
}
