import vine from "@vinejs/vine"

export const updatePlaceValidator = vine.compile(
  vine.object({
    id: vine.number(),
    name: vine.string().maxLength(255).optional(),
    address: vine.string().maxLength(255).optional(),
    description: vine.string().optional(),
    clubId: vine.number().optional()
  })
)