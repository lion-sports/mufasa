import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { SPORTS } from 'App/Models/Scout'
import { FIELD_RENDER_ENGINES, FRIENDS_FIELD_SIDES, POSSIBLE_AUTO_PAHSE_EVENTS, POSSIBLE_AUTO_POINT_ENEMY_EVENTS, POSSIBLE_AUTO_POINT_FRIENDS_EVENTS } from 'lionn-common'

export default class UpdateScoutValidator {
  constructor(protected ctx?: HttpContextContract) { }

  public schema = schema.create({
    id: schema.number.optional(),
    sport: schema.enum.optional(SPORTS),
    name: schema.string.optional(),
    startedAt: schema.date.optional(),
    eventId: schema.number.optional(),
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
