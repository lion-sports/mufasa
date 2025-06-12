import vine from "@vinejs/vine"
import { SPORTS } from "lionn-common"

export const updateClubValidator = vine.compile(
  vine.object({
    id: vine.number(),
    name: vine.string().maxLength(255).optional(),
    completeName: vine.string().maxLength(255).optional(),
    bio: vine.string().nullable().optional(),
    sport: vine.enum(SPORTS).optional(),
  })
)