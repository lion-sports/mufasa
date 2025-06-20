import vine from '@vinejs/vine'

export const requestBookingValidator = vine.compile(
  vine.object({
    placeId: vine.number(),
    from: vine.date({ formats: { utc: true } }),
    to: vine.date({ formats: { utc: true } }),
  })
)

export const updateBookingValidator = vine.compile(
  vine.object({
    id: vine.number(),
    placeId: vine.number().optional(),
    from: vine.date({ formats: { utc: true } }).optional(),
    to: vine.date({ formats: { utc: true } }).optional(),
  })
)