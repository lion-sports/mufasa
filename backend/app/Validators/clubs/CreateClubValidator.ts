import vine from '@vinejs/vine'
import { SPORTS } from 'lionn-common'

export const createClubValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    completeName: vine.string().maxLength(255),
    bio: vine.string().nullable().optional(),
    sport: vine.enum(SPORTS).nullable().optional(),
    public: vine.boolean().optional()
  })
)