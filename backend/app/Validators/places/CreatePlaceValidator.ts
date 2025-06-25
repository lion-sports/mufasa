import vine from '@vinejs/vine'

export const createPlaceValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    address: vine.string().maxLength(255).optional(),
    description: vine.string().optional(),
    clubId: vine.number()
  })
)