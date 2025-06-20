import vine from '@vinejs/vine'

export const requestBookingValidator = vine.compile(
  vine.object({
    placeId: vine.number(),
    from: vine.date({ formats: { utc: true }}),
    to: vine.date({ formats: { utc: true } }),
    description: vine.string().optional(),
  })
)