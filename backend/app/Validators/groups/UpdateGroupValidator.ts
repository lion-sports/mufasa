import vine from '@vinejs/vine'

export const updateGroupValidator = vine.compile(
  vine.object({
    id: vine.number(),
    name: vine.string().maxLength(255).optional(),
    cans: vine.object({}).allowUnknownProperties()
  })
)
