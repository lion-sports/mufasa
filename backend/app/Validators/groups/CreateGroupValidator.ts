import vine from '@vinejs/vine'

export const createGroupValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    team: vine.object({
      id: vine.number()
    }).optional(),
    convocable: vine.boolean().optional(),
    club: vine.object({
      id: vine.number()
    }).optional().requiredIfMissing('team'),
    cans: vine.object({}).allowUnknownProperties().optional()
  })
)