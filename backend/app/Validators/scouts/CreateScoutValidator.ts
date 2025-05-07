import { schema } from '@adonisjs/validator'
import type { HttpContext } from '@adonisjs/core/http'
import { FIELD_RENDER_ENGINES, FRIENDS_FIELD_SIDES, POSSIBLE_AUTO_PAHSE_EVENTS, POSSIBLE_AUTO_POINT_ENEMY_EVENTS, POSSIBLE_AUTO_POINT_FRIENDS_EVENTS, SPORTS } from 'lionn-common'
import { CustomMessages } from "@adonisjs/validator/types";

export default class CreateScoutValidator {
  constructor(protected ctx?: HttpContext) { }

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
        friendsFieldSide: schema.enum.optional(FRIENDS_FIELD_SIDES),
        fieldRenderEngine: schema.enum.optional(FIELD_RENDER_ENGINES)
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
          }),
          autoPhase: schema.object.optional().members({
            friends: schema.array.optional().members(
              schema.enum(POSSIBLE_AUTO_PAHSE_EVENTS)
            ),
            enemy: schema.array.optional().members(
              schema.enum(POSSIBLE_AUTO_PAHSE_EVENTS)
            )
          })
        }),
      })
    })
  })

  public messages: CustomMessages = {}
}
